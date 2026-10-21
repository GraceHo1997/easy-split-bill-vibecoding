import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Receipt, Users, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedReceipt {
  items: Array<{ name: string; price: number }>;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

interface Selection {
  id: string;
  participant_id: string;
  participant_name: string;
  item_index: number;
  share_count: number;
  my_portions: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const getParticipantId = () => {
  let id = localStorage.getItem('easysplit-participant-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('easysplit-participant-id', id);
  }
  return id;
};

const SharedBill = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const participantId = useMemo(getParticipantId, []);
  const [receipt, setReceipt] = useState<ParsedReceipt | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [name, setName] = useState(() => localStorage.getItem('easysplit-name') || '');
  const [nameInput, setNameInput] = useState(name);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const loadSelections = async () => {
    const { data } = await supabase.from('bill_selections').select('*').eq('session_id', id!);
    if (data) setSelections(data as Selection[]);
  };

  useEffect(() => {
    if (!id) return;
    supabase.from('bill_sessions').select('receipt').eq('id', id).maybeSingle().then(({ data }) => {
      if (!data) setNotFound(true);
      else setReceipt(data.receipt as unknown as ParsedReceipt);
    });
    loadSelections();
    const channel = supabase
      .channel(`bill-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bill_selections', filter: `session_id=eq.${id}` }, () => loadSelections())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const mine = selections.filter((s) => s.participant_id === participantId);
  const mineByItem = new Map(mine.map((s) => [s.item_index, s]));

  const toggleItem = async (index: number) => {
    const existing = mineByItem.get(index);
    if (existing) {
      setSelections((prev) => prev.filter((s) => s.id !== existing.id));
      await supabase.from('bill_selections').delete().eq('id', existing.id);
    } else {
      // Default split count to what others already entered
      const other = selections.find((s) => s.item_index === index);
      const { data, error } = await supabase.from('bill_selections').insert({
        session_id: id!, participant_id: participantId, participant_name: name,
        item_index: index, share_count: other?.share_count ?? 1, my_portions: 1,
      }).select().single();
      if (error) toast({ title: 'Error', description: 'Could not save selection', variant: 'destructive' });
      else if (data) setSelections((prev) => [...prev, data as Selection]);
    }
  };

  const updateField = async (sel: Selection, field: 'share_count' | 'my_portions', raw: string) => {
    let value = parseInt(raw) || 1;
    let share = sel.share_count, portions = sel.my_portions;
    if (field === 'share_count') { share = Math.max(1, value); portions = Math.min(portions, share); }
    else { value = Math.min(Math.max(1, value), share); portions = value; }
    setDrafts((d) => { const n = { ...d }; delete n[`${sel.id}-${field}`]; return n; });
    setSelections((prev) => prev.map((s) => s.id === sel.id ? { ...s, share_count: share, my_portions: portions } : s));
    await supabase.from('bill_selections').update({ share_count: share, my_portions: portions }).eq('id', sel.id);
  };

  const saveName = async () => {
    const n = nameInput.trim();
    if (!n) return;
    localStorage.setItem('easysplit-name', n);
    setName(n);
    if (mine.length) await supabase.from('bill_selections').update({ participant_name: n }).eq('session_id', id!).eq('participant_id', participantId);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Send it to your friends' });
  };

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-lg">This bill link was not found.</p>
      <Button asChild><Link to="/">Go to EasySplit</Link></Button>
    </div>
  );
  if (!receipt) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading bill...</div>;

  const myItems = receipt.items.map((item, index) => ({ item, sel: mineByItem.get(index) })).filter((x) => x.sel);
  const mySubtotal = myItems.reduce((sum, { item, sel }) => sum + round2(item.price / sel!.share_count * sel!.my_portions), 0);
  const proportion = receipt.subtotal > 0 ? mySubtotal / receipt.subtotal : 0;
  const myTax = round2(receipt.tax * proportion);
  const myTip = round2(receipt.tip * proportion);
  const myTotal = mySubtotal + myTax + myTip;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold">EasySplit</h1>
          <p className="text-muted-foreground">Pick what you ordered — everyone sees updates live</p>
        </div>

        <Button variant="outline" onClick={copyLink} className="w-full">
          <Link2 className="h-4 w-4 mr-2" /> Copy link to share with friends
        </Button>

        {!name ? (
          <Card>
            <CardHeader><CardTitle className="text-lg">What's your name?</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="e.g. Alex"
                onKeyDown={(e) => e.key === 'Enter' && saveName()} />
              <Button onClick={saveName} disabled={!nameInput.trim()}>Join</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span>Selecting as <strong>{name}</strong></span>
              <Button variant="ghost" size="sm" onClick={() => setName('')}>Change name</Button>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Item List</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {receipt.items.map((item, index) => {
                  const sel = mineByItem.get(index);
                  const others = selections.filter((s) => s.item_index === index && s.participant_id !== participantId);
                  return (
                    <div key={index} onClick={() => toggleItem(index)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${sel ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex items-center gap-3">
                        <Checkbox checked={!!sel} onCheckedChange={() => toggleItem(index)} onClick={(e) => e.stopPropagation()} />
                        <span className="flex-1 font-medium">{item.name}</span>
                        <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                      </div>
                      {sel && (
                        <div className="flex items-center gap-2 flex-wrap mt-2 ml-7" onClick={(e) => e.stopPropagation()}>
                          <Users className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">split by</span>
                          {(['share_count', 'my_portions'] as const).map((field, i) => (
                            <span key={field} className="flex items-center gap-2">
                              {i === 1 && <span className="text-sm text-muted-foreground">, I pay</span>}
                              <Input type="number" min="1" className="w-16 h-8 text-center no-arrows"
                                value={drafts[`${sel.id}-${field}`] ?? String(sel[field])}
                                onFocus={() => setDrafts((d) => ({ ...d, [`${sel.id}-${field}`]: '' }))}
                                onChange={(e) => setDrafts((d) => ({ ...d, [`${sel.id}-${field}`]: e.target.value }))}
                                onBlur={(e) => updateField(sel, field, e.target.value)} />
                            </span>
                          ))}
                          <span className="text-sm text-muted-foreground">shares</span>
                        </div>
                      )}
                      {others.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 ml-7">
                          {others.map((o) => (
                            <span key={o.id} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                              {o.participant_name}{o.share_count > 1 ? ` · split by ${o.share_count}, pays ${o.my_portions}` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 sticky bottom-4">
              <CardContent className="pt-6 space-y-1 text-sm">
                <div className="flex justify-between"><span>Your items</span><span>${mySubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Your share of tax</span><span>${myTax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Your share of tip</span><span>${myTip.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold">
                  <span>You need to pay</span><span className="text-success">${myTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SharedBill;
