import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { ArrowLeft, Calculator } from 'lucide-react';
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
    }))
  );
  const [customAmount, setCustomAmount] = useState<string>('');

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedItems = useMemo(() => {
    return items.filter(item => item.selected);
  }, [items]);

  const calculateMyShare = () => {
    // Calculate selected items total
    const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
    
    // Add custom amount if entered
    const customAmountNum = customAmount ? parseFloat(customAmount) || 0 : 0;
    
    const mySubtotal = selectedTotal + customAmountNum;
    
    if (mySubtotal <= 0) {
      toast({
        title: "請選擇品項",
        description: "請選擇至少一個品項或輸入金額",
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
          回上一頁
        </Button>
        <h2 className="text-2xl font-bold">選擇您的品項</h2>
      </div>

      {/* Receipt Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">收據總覽</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>小計:</span>
            <span>${parsedReceipt.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>稅金:</span>
            <span>${parsedReceipt.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>小費:</span>
            <span>${parsedReceipt.tip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>總計:</span>
            <span>${parsedReceipt.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Items Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">品項列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="mt-6 p-4 border rounded-lg bg-muted/50">
            <label className="block text-sm font-medium mb-2">
              或直接輸入您的消費金額:
            </label>
            <Input
              type="number"
              placeholder="輸入金額（例如: 25.50）"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              如果您知道確切金額，可直接在此輸入
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {hasSelection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">您的選擇</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
              {customAmount && parseFloat(customAmount) > 0 && (
                <div className="flex justify-between">
                  <span>自訂金額</span>
                  <span>${parseFloat(customAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>小計:</span>
                  <span>${(
                    selectedItems.reduce((sum, item) => sum + item.price, 0) +
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
            清除選擇
          </Button>
        )}
        <Button 
          onClick={calculateMyShare}
          disabled={!hasSelection}
          className="flex items-center gap-2 flex-1"
        >
          <Calculator className="h-4 w-4" />
          計算我的分攤金額
        </Button>
      </div>
    </div>
  );
};