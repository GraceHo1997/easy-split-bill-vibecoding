import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, DollarSign } from 'lucide-react';

interface ParsedReceipt {
  items: Array<{
    name: string;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

interface IndividualItemCalculatorProps {
  parsedReceipt: ParsedReceipt;
  onBack: () => void;
  onStartOver: () => void;
}

export const IndividualItemCalculator: React.FC<IndividualItemCalculatorProps> = ({ 
  parsedReceipt, 
  onBack, 
  onStartOver 
}) => {
  // Calculate the rate for tax and tip
  const taxRate = parsedReceipt.subtotal > 0 ? parsedReceipt.tax / parsedReceipt.subtotal : 0;
  const tipRate = parsedReceipt.subtotal > 0 ? parsedReceipt.tip / parsedReceipt.subtotal : 0;

  const calculateItemTotal = (itemPrice: number) => {
    const itemTax = itemPrice * taxRate;
    const itemTip = itemPrice * tipRate;
    return itemPrice + itemTax + itemTip;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Individual Item Costs</h2>
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
            <span>${parsedReceipt.tax.toFixed(2)} ({(taxRate * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>${parsedReceipt.tip.toFixed(2)} ({(tipRate * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total:</span>
            <span>${parsedReceipt.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Individual Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Individual Item Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {parsedReceipt.items.map((item, index) => {
              const itemTotal = calculateItemTotal(item.price);
              const itemTax = item.price * taxRate;
              const itemTip = item.price * tipRate;
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-lg font-bold text-primary">${itemTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Base price:</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ Tax:</span>
                      <span>${itemTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ Tip:</span>
                      <span>${itemTip.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button onClick={onStartOver} className="w-full">
        <DollarSign className="h-4 w-4 mr-2" />
        Calculate Another Receipt
      </Button>
    </div>
  );
};