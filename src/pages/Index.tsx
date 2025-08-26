import { useState } from 'react';
import { ReceiptUpload } from '@/components/ReceiptUpload';
import { ItemSelector } from '@/components/ItemSelector';
import { PaymentSummary } from '@/components/PaymentSummary';
import { Badge } from '@/components/ui/badge';
import { Receipt, Users, Calculator, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

type Step = 'upload' | 'select' | 'summary';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [billTotals, setBillTotals] = useState<BillTotals | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // First, process the receipt with OCR
      const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-receipt', {
        body: formData,
      });

      if (ocrError || !ocrData?.success) {
        console.error('Error processing receipt:', ocrError);
        toast({
          title: "處理錯誤",
          description: "無法處理您的收據，請稍後再試",
          variant: "destructive",
        });
        return;
      }

      // Then, interpret the OCR text with OpenAI
      const { data: interpretData, error: interpretError } = await supabase.functions.invoke('interpret-receipt', {
        body: { ocrText: ocrData.text },
      });

      if (interpretError || !interpretData?.success) {
        console.error('Error interpreting receipt:', interpretError);
        toast({
          title: "解析錯誤",
          description: "無法解析收據內容，請稍後再試",
          variant: "destructive",
        });
        return;
      }

      setParsedReceipt(interpretData.interpretation);
      setCurrentStep('select');
      toast({
        title: "上傳成功",
        description: "收據已成功解析，請選擇您的品項",
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "上傳失敗",
        description: "處理收據時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculate = (totals: BillTotals) => {
    setBillTotals(totals);
    setCurrentStep('summary');
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setParsedReceipt(null);
    setBillTotals(null);
  };

  const handleBackToSelect = () => {
    setCurrentStep('select');
    setBillTotals(null);
  };

  const getStepNumber = (step: Step) => {
    switch (step) {
      case 'upload': return 1;
      case 'select': return 2;
      case 'summary': return 3;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Expense Clarify</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Split restaurant bills fairly with AI-powered receipt scanning
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered OCR
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Fair Splitting
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Calculator className="w-4 h-4 mr-2" />
              Auto Calculation
            </Badge>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['Upload Receipt', 'Select Items', 'View Summary'].map((label, index) => {
              const stepNum = index + 1;
              const isActive = getStepNumber(currentStep) === stepNum;
              const isCompleted = getStepNumber(currentStep) > stepNum;
              
              return (
                <div key={label} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${isActive 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : isCompleted 
                        ? 'bg-success text-success-foreground border-success'
                        : 'bg-background text-muted-foreground border-border'
                    }
                  `}>
                    {stepNum}
                  </div>
                  {index < 2 && (
                    <div className={`
                      w-12 h-0.5 mx-2 transition-all duration-300
                      ${isCompleted ? 'bg-success' : 'bg-border'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'upload' && (
            <ReceiptUpload 
              onUpload={handleFileUpload} 
              isProcessing={isProcessing}
            />
          )}

          {currentStep === 'select' && parsedReceipt && (
            <ItemSelector
              parsedReceipt={parsedReceipt}
              onCalculate={handleCalculate}
              onBack={() => setCurrentStep('upload')}
            />
          )}

          {currentStep === 'summary' && billTotals && (
            <PaymentSummary
              billTotals={billTotals}
              onStartOver={handleStartOver}
              onBack={handleBackToSelect}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Built with AI-powered OCR technology for accurate receipt parsing
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;