import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, DollarSign, Download, Share2, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const summaryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Calculate the rate for tax and tip
  const taxRate = parsedReceipt.subtotal > 0 ? parsedReceipt.tax / parsedReceipt.subtotal : 0;
  const tipRate = parsedReceipt.subtotal > 0 ? parsedReceipt.tip / parsedReceipt.subtotal : 0;

  const calculateItemTotal = (itemPrice: number) => {
    const itemTax = itemPrice * taxRate;
    const itemTip = itemPrice * tipRate;
    return itemPrice + itemTax + itemTip;
  };

  const handleDownloadImage = async () => {
    if (!summaryRef.current) return;
    
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      if (isMobile) {
        // On mobile, open image in new tab so user can save to photos
        const dataURL = canvas.toDataURL('image/png');
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>EasySplit Breakdown</title></head>
              <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
                <img src="${dataURL}" style="max-width:100%;height:auto;" alt="Item Breakdown" />
              </body>
            </html>
          `);
          newWindow.document.close();
        }
        toast({
          title: "Image opened!",
          description: "Long press the image to save it to your photos",
        });
      } else {
        // Desktop: traditional download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'easysplit-breakdown.png';
            a.click();
            URL.revokeObjectURL(url);
            toast({
              title: "Download started!",
              description: "Item breakdown downloaded as image",
            });
          }
        });
      }
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
            const file = new File([blob], 'easysplit-breakdown.png', { type: 'image/png' });
            await navigator.share({
              title: 'EasySplit Item Breakdown',
              files: [file]
            });
            toast({
              title: "Shared successfully!",
              description: "Item breakdown shared",
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

  const handleCopyImage = async () => {
    if (!summaryRef.current) return;
    
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && navigator.clipboard.write) {
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            toast({
              title: "Copied to clipboard!",
              description: "Item breakdown image copied",
            });
          } catch (err) {
            toast({
              title: "Copy failed",
              description: "Unable to copy image to clipboard",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Copy not supported",
            description: "Image copying is not supported on this browser",
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {isMobile ? (
          <Button 
            onClick={handleShareImage}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Image
          </Button>
        ) : (
          <div className="flex gap-4">
            <Button 
              onClick={handleDownloadImage}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
            <Button 
              onClick={handleCopyImage}
              variant="secondary"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Image
            </Button>
          </div>
        )}
        
        <Button onClick={onStartOver} className="w-full" variant="outline">
          <DollarSign className="h-4 w-4 mr-2" />
          Calculate Another Receipt
        </Button>
      </div>
    </div>
  );
};