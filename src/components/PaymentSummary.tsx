import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Receipt, Calculator, Share } from 'lucide-react';

interface LineItem {
  id: string;
  text: string;
  price: number;
  selected: boolean;
}

interface PaymentSummaryProps {
  selectedItems: LineItem[];
  billTotals: { subtotal: number; tax: number; tip: number; total: number };
  onStartOver: () => void;
}

export const PaymentSummary = ({ selectedItems, billTotals, onStartOver }: PaymentSummaryProps) => {
  const calculations = useMemo(() => {
    const myItemsTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const billSubtotal = billTotals.subtotal || selectedItems.reduce((sum, item) => sum + item.price, 0);
    
    // Calculate my proportion of the bill
    const myProportion = billSubtotal > 0 ? myItemsTotal / billSubtotal : 0;
    
    // Proportionally split tax and tip
    const myTax = billTotals.tax * myProportion;
    const myTip = billTotals.tip * myProportion;
    
    // Calculate total amount I owe
    const myTotal = myItemsTotal + myTax + myTip;
    
    return {
      myItemsTotal,
      myTax,
      myTip,
      myTotal,
      myProportion: myProportion * 100
    };
  }, [selectedItems, billTotals]);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success text-success-foreground">
            <DollarSign className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-success">You Need to Pay</h2>
            <div className="text-4xl font-bold mt-2">
              ${calculations.myTotal.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ({calculations.myProportion.toFixed(1)}% of the total bill)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Payment Breakdown
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span>Your Items</span>
            <Badge variant="secondary">${calculations.myItemsTotal.toFixed(2)}</Badge>
          </div>
          
          {calculations.myTax > 0 && (
            <div className="flex justify-between items-center py-2">
              <span>Your Share of Tax</span>
              <Badge variant="secondary">${calculations.myTax.toFixed(2)}</Badge>
            </div>
          )}
          
          {calculations.myTip > 0 && (
            <div className="flex justify-between items-center py-2">
              <span>Your Share of Tip</span>
              <Badge variant="secondary">${calculations.myTip.toFixed(2)}</Badge>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total Amount</span>
              <Badge className="text-lg px-3 py-1">${calculations.myTotal.toFixed(2)}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Receipt className="w-5 h-5 mr-2" />
          Your Selected Items
        </h3>
        
        <div className="space-y-2">
          {selectedItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-sm">{item.text}</span>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onStartOver} className="flex-1">
          <Share className="w-4 h-4 mr-2" />
          Split Another Receipt
        </Button>
        
        <Button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My Receipt Split',
                text: `I need to pay $${calculations.myTotal.toFixed(2)} for my share of the bill.`,
              });
            }
          }}
          className="flex-1"
        >
          Share Result
        </Button>
      </div>
    </div>
  );
};