import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { ArrowLeft, Calculator, Users } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface ParsedReceipt {
  items: Array<{
    name: string;
    price: number;
    selected?: boolean;
  }>;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

interface BillTotals {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  userShare: number;
  selectedItems?: Array<{
    name: string;
    price: number;
    shareCount: number;
    itemShare: number;
  }>;
  customAmount?: number;
}

interface ItemSelectorProps {
  parsedReceipt: ParsedReceipt;
  onCalculate: (totals: BillTotals) => void;
  onBack: () => void;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({ parsedReceipt, onCalculate, onBack }) => {
  const { toast } = useToast();
  const [items, setItems] = useState(() => 
    parsedReceipt.items.map((item, index) => ({
      ...item,
      id: `item-${index}`,
      selected: false,
      shareCount: 1,
    }))
  );
  const [customAmount, setCustomAmount] = useState<string>('');

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateShareCount = (id: string, shareCount: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, shareCount: shareCount || 1 } : item
    ));
  };

  const handleShareCountFocus = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, shareCount: '' as any } : item
    ));
  };

  const handleShareCountBlur = (id: string, value: string) => {
    const shareCount = parseInt(value) || 1;
    updateShareCount(id, shareCount);
  };

  const selectedItems = useMemo(() => {
    return items.filter(item => item.selected);
  }, [items]);

  const calculateMyShare = () => {
    // Calculate selected items total with sharing (divide first, then round)
    const selectedTotal = selectedItems.reduce((sum, item) => {
      const itemShare = Math.round((item.price / item.shareCount) * 100) / 100;
      return sum + itemShare;
    }, 0);
    
    // Add custom amount if entered
    const customAmountNum = customAmount ? parseFloat(customAmount) || 0 : 0;
    
    const mySubtotal = selectedTotal + customAmountNum;
    
    if (mySubtotal <= 0) {
      toast({
        title: "Please select items",
        description: "Please select at least one item or enter an amount",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate proportional tax and tip
    const proportion = mySubtotal / parsedReceipt.subtotal;
    const myTax = parsedReceipt.tax * proportion;
    const myTip = parsedReceipt.tip * proportion;
    const myTotal = mySubtotal + myTax + myTip;

    const totals: BillTotals = {
      subtotal: mySubtotal,
      tax: myTax,
      tip: myTip,
      total: myTotal,
      userShare: myTotal,
      selectedItems: selectedItems.map(item => ({
        name: item.name,
        price: item.price,
        shareCount: item.shareCount,
        itemShare: Math.round((item.price / item.shareCount) * 100) / 100
      })),
      customAmount: customAmountNum > 0 ? customAmountNum : undefined,
    };

    onCalculate(totals);
  };

  const clearSelection = () => {
    setItems(items.map(item => ({ ...item, selected: false })));
    setCustomAmount('');
  };

  const hasSelection = selectedItems.length > 0 || (customAmount && parseFloat(customAmount) > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Select Your Items</h2>
      </div>

      {/* Receipt Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receipt Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${parsedReceipt.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${parsedReceipt.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>${parsedReceipt.tip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total:</span>
            <span>${parsedReceipt.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Items Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Item List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                    {item.selected && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Users className="h-4 w-4" />
                        <Input
                          type="number"
                          min="1"
                          value={item.shareCount}
                          onChange={(e) => updateShareCount(item.id, parseInt(e.target.value) || 1)}
                          onFocus={() => handleShareCountFocus(item.id)}
                          onBlur={(e) => handleShareCountBlur(item.id, e.target.value)}
                          className="w-16 h-8 text-center no-arrows"
                        />
                        <span className="text-sm text-muted-foreground">people</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <label className="block text-sm font-medium mb-2">
              Or enter your total amount directly:
            </label>
            <Input
              type="number"
              placeholder="Enter amount (e.g. 25.50)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              If you know the exact amount, enter it here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {hasSelection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} 
                    {item.shareCount > 1 && (
                      <span className="text-muted-foreground ml-1">
                        (÷{item.shareCount})
                      </span>
                    )}
                  </span>
                  <span>${(Math.round((item.price / item.shareCount) * 100) / 100).toFixed(2)}</span>
                </div>
              ))}
              {customAmount && parseFloat(customAmount) > 0 && (
                <div className="flex justify-between">
                  <span>Custom amount</span>
                  <span>${parseFloat(customAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(
                    selectedItems.reduce((sum, item) => {
                      const itemShare = Math.round((item.price / item.shareCount) * 100) / 100;
                      return sum + itemShare;
                    }, 0) +
                    (customAmount ? parseFloat(customAmount) || 0 : 0)
                  ).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {hasSelection && (
          <Button variant="outline" onClick={clearSelection}>
            Clear Selection
          </Button>
        )}
        <Button 
          onClick={calculateMyShare}
          disabled={!hasSelection}
          className="flex items-center gap-2 flex-1"
        >
          <Calculator className="h-4 w-4" />
          Calculate My Share
        </Button>
      </div>
    </div>
  );
};