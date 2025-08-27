import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Receipt, RotateCcw, ArrowLeft, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

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
  const summaryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownloadImage = async () => {
    if (!summaryRef.current) return;
    
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'easysplit-summary.png';
          a.click();
          URL.revokeObjectURL(url);
          toast({
            title: "Download started!",
            description: "Payment summary downloaded as image",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    }
  };

  const handleShareImage = async () => {
    if (!summaryRef.current) return;
    
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          try {
            const file = new File([blob], 'easysplit-summary.png', { type: 'image/png' });
            await navigator.share({
              title: 'EasySplit Payment Summary',
              text: `My share: $${billTotals.userShare.toFixed(2)}`,
              files: [file]
            });
            toast({
              title: "Shared successfully!",
              description: "Payment summary shared",
            });
          } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
              toast({
                title: "Share failed",
                description: "Unable to share image",
                variant: "destructive",
              });
            }
          }
        } else {
          toast({
            title: "Share not supported",
            description: "Web Share API is not supported on this device",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div ref={summaryRef} className="space-y-6 p-6 bg-background rounded-lg">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Payment Summary</h2>
          </div>
        </div>

        <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success text-success-foreground">
              <Receipt className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-success">You Need to Pay</h2>
              <div className="text-4xl font-bold mt-2">
                ${billTotals.userShare.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg">Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span>Your Item Subtotal</span>
              <span className="font-medium">${billTotals.subtotal.toFixed(2)}</span>
            </div>
            
            {billTotals.tax > 0 && (
              <div className="flex justify-between items-center py-2">
                <span>Your Share of Tax</span>
                <span className="font-medium">${billTotals.tax.toFixed(2)}</span>
              </div>
            )}
            
            {billTotals.tip > 0 && (
              <div className="flex justify-between items-center py-2">
                <span>Your Share of Tip</span>
                <span className="font-medium">${billTotals.tip.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total Amount</span>
                <span className="text-2xl font-bold text-primary">${billTotals.userShare.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Button 
            onClick={handleDownloadImage}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
          <Button 
            onClick={handleShareImage}
            variant="secondary"
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Recalculate
          </Button>
          <Button onClick={onStartOver} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
};