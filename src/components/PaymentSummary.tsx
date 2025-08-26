import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Receipt, RotateCcw, ArrowLeft } from 'lucide-react';

interface BillTotals {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  userShare: number;
}

interface PaymentSummaryProps {
  billTotals: BillTotals;
  onStartOver: () => void;
  onBack: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ 
  billTotals, 
  onStartOver,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          重新選擇
        </Button>
        <div className="flex items-center gap-3">
          <Receipt className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">付款摘要</h2>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success text-success-foreground">
            <Receipt className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-success">您需要支付</h2>
            <div className="text-4xl font-bold mt-2">
              ${billTotals.userShare.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">付款明細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span>您的品項小計</span>
            <span className="font-medium">${billTotals.subtotal.toFixed(2)}</span>
          </div>
          
          {billTotals.tax > 0 && (
            <div className="flex justify-between items-center py-2">
              <span>您分攤的稅金</span>
              <span className="font-medium">${billTotals.tax.toFixed(2)}</span>
            </div>
          )}
          
          {billTotals.tip > 0 && (
            <div className="flex justify-between items-center py-2">
              <span>您分攤的小費</span>
              <span className="font-medium">${billTotals.tip.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>總計金額</span>
              <span className="text-2xl font-bold text-primary">${billTotals.userShare.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          重新選擇
        </Button>
        <Button onClick={onStartOver} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          重新開始
        </Button>
      </div>
    </div>
  );
};