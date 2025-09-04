import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowLeft, Percent, DollarSign } from 'lucide-react';
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

interface TipInputProps {
  parsedReceipt: ParsedReceipt;
  onTipUpdate: (updatedReceipt: ParsedReceipt) => void;
  onBack: () => void;
}

export const TipInput: React.FC<TipInputProps> = ({ parsedReceipt, onTipUpdate, onBack }) => {
  const { toast } = useToast();
  const [tipType, setTipType] = useState<'amount' | 'percentage'>('percentage');
  const [tipValue, setTipValue] = useState<string>('');

  const handleContinue = () => {
    const inputValue = parseFloat(tipValue);
    
    if (!tipValue || isNaN(inputValue) || inputValue < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid tip amount or percentage",
        variant: "destructive",
      });
      return;
    }

    let calculatedTip: number;
    
    if (tipType === 'percentage') {
      if (inputValue > 100) {
        toast({
          title: "Invalid percentage",
          description: "Tip percentage cannot exceed 100%",
          variant: "destructive",
        });
        return;
      }
      calculatedTip = Math.round((parsedReceipt.subtotal * inputValue) / 100 * 100) / 100;
    } else {
      calculatedTip = inputValue;
    }

    const newTotal = parsedReceipt.subtotal + parsedReceipt.tax + calculatedTip;
    
    const updatedReceipt: ParsedReceipt = {
      ...parsedReceipt,
      tip: calculatedTip,
      total: newTotal,
    };

    onTipUpdate(updatedReceipt);
  };

  const handleSkip = () => {
    onTipUpdate(parsedReceipt);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Add Tip Information</h2>
      </div>

      {/* Receipt Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Receipt Summary</CardTitle>
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
          <div className="flex justify-between text-orange-600">
            <span>Tip:</span>
            <span>Not detected</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total (without tip):</span>
            <span>${(parsedReceipt.subtotal + parsedReceipt.tax).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tip Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enter Tip Information</CardTitle>
          <p className="text-muted-foreground">
            We couldn't detect tip on your receipt. Please add it manually.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tip Type Selection */}
          <div>
            <Label className="text-base font-medium">How would you like to enter tip?</Label>
            <RadioGroup
              value={tipType}
              onValueChange={(value: 'amount' | 'percentage') => setTipType(value)}
              className="mt-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Percent className="h-4 w-4" />
                  <span>Tip percentage (e.g., 15%)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="amount" id="amount" />
                <Label htmlFor="amount" className="flex items-center gap-2 cursor-pointer flex-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Tip amount (e.g., $5.00)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tip Input */}
          <div>
            <Label htmlFor="tip-input" className="text-base font-medium">
              {tipType === 'percentage' ? 'Tip Percentage' : 'Tip Amount'}
            </Label>
            <div className="relative mt-2">
              <Input
                id="tip-input"
                type="number"
                step={tipType === 'percentage' ? '0.1' : '0.01'}
                min="0"
                max={tipType === 'percentage' ? '100' : undefined}
                placeholder={tipType === 'percentage' ? 'Enter percentage (e.g., 15)' : 'Enter amount (e.g., 5.00)'}
                value={tipValue}
                onChange={(e) => setTipValue(e.target.value)}
                className="pl-8"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {tipType === 'percentage' ? (
                  <Percent className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tipType === 'percentage' 
                ? `This will calculate ${tipValue ? `$${(Math.round(((parseFloat(tipValue) || 0) * parsedReceipt.subtotal / 100) * 100) / 100).toFixed(2)}` : '$0.00'} based on your subtotal`
                : 'Enter the tip amount directly from your receipt'
              }
            </p>
          </div>

          {/* Preview */}
          {tipValue && !isNaN(parseFloat(tipValue)) && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${parsedReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${parsedReceipt.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Tip:</span>
                    <span>
                      ${tipType === 'percentage' 
                        ? (Math.round(((parseFloat(tipValue) * parsedReceipt.subtotal) / 100) * 100) / 100).toFixed(2)
                        : parseFloat(tipValue).toFixed(2)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>New Total:</span>
                    <span>
                      ${(parsedReceipt.subtotal + 
                        parsedReceipt.tax +
                        (tipType === 'percentage' 
                          ? Math.round(((parseFloat(tipValue) * parsedReceipt.subtotal) / 100) * 100) / 100
                          : parseFloat(tipValue)
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleSkip} className="flex-1">
          Skip (No Tip)
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!tipValue || isNaN(parseFloat(tipValue))}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};