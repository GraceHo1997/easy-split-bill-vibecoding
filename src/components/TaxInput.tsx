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

interface TaxInputProps {
  parsedReceipt: ParsedReceipt;
  onTaxUpdate: (updatedReceipt: ParsedReceipt) => void;
  onBack: () => void;
}

export const TaxInput: React.FC<TaxInputProps> = ({ parsedReceipt, onTaxUpdate, onBack }) => {
  const { toast } = useToast();
  const [taxType, setTaxType] = useState<'amount' | 'percentage'>('percentage');
  const [taxValue, setTaxValue] = useState<string>('');

  const handleContinue = () => {
    const inputValue = parseFloat(taxValue);
    
    if (!taxValue || isNaN(inputValue) || inputValue < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid tax amount or percentage",
        variant: "destructive",
      });
      return;
    }

    let calculatedTax: number;
    
    if (taxType === 'percentage') {
      if (inputValue > 100) {
        toast({
          title: "Invalid percentage",
          description: "Tax percentage cannot exceed 100%",
          variant: "destructive",
        });
        return;
      }
      calculatedTax = (parsedReceipt.subtotal * inputValue) / 100;
    } else {
      calculatedTax = inputValue;
    }

    const newTotal = parsedReceipt.subtotal + calculatedTax + parsedReceipt.tip;
    
    const updatedReceipt: ParsedReceipt = {
      ...parsedReceipt,
      tax: calculatedTax,
      total: newTotal,
    };

    onTaxUpdate(updatedReceipt);
  };

  const handleSkip = () => {
    onTaxUpdate(parsedReceipt);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Add Tax Information</h2>
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
          <div className="flex justify-between text-orange-600">
            <span>Tax:</span>
            <span>Not detected</span>
          </div>
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>${parsedReceipt.tip.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total (without tax):</span>
            <span>${(parsedReceipt.subtotal + parsedReceipt.tip).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tax Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enter Tax Information</CardTitle>
          <p className="text-muted-foreground">
            We couldn't detect tax on your receipt. Please add it manually.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tax Type Selection */}
          <div>
            <Label className="text-base font-medium">How would you like to enter tax?</Label>
            <RadioGroup
              value={taxType}
              onValueChange={(value: 'amount' | 'percentage') => setTaxType(value)}
              className="mt-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Percent className="h-4 w-4" />
                  <span>Tax percentage (e.g., 8.5%)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="amount" id="amount" />
                <Label htmlFor="amount" className="flex items-center gap-2 cursor-pointer flex-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Tax amount (e.g., $5.25)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tax Input */}
          <div>
            <Label htmlFor="tax-input" className="text-base font-medium">
              {taxType === 'percentage' ? 'Tax Percentage' : 'Tax Amount'}
            </Label>
            <div className="relative mt-2">
              <Input
                id="tax-input"
                type="number"
                step={taxType === 'percentage' ? '0.1' : '0.01'}
                min="0"
                max={taxType === 'percentage' ? '100' : undefined}
                placeholder={taxType === 'percentage' ? 'Enter percentage (e.g., 8.5)' : 'Enter amount (e.g., 5.25)'}
                value={taxValue}
                onChange={(e) => setTaxValue(e.target.value)}
                className="pl-8"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {taxType === 'percentage' ? (
                  <Percent className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {taxType === 'percentage' 
                ? `This will calculate ${taxValue ? `$${((parseFloat(taxValue) || 0) * parsedReceipt.subtotal / 100).toFixed(2)}` : '$0.00'} based on your subtotal`
                : 'Enter the tax amount directly from your receipt'
              }
            </p>
          </div>

          {/* Preview */}
          {taxValue && !isNaN(parseFloat(taxValue)) && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${parsedReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Tax:</span>
                    <span>
                      ${taxType === 'percentage' 
                        ? ((parseFloat(taxValue) * parsedReceipt.subtotal) / 100).toFixed(2)
                        : parseFloat(taxValue).toFixed(2)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${parsedReceipt.tip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>New Total:</span>
                    <span>
                      ${(parsedReceipt.subtotal + 
                        (taxType === 'percentage' 
                          ? (parseFloat(taxValue) * parsedReceipt.subtotal) / 100
                          : parseFloat(taxValue)
                        ) + 
                        parsedReceipt.tip
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
          Skip (No Tax)
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!taxValue || isNaN(parseFloat(taxValue))}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};