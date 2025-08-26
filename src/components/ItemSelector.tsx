import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react';

interface LineItem {
  id: string;
  text: string;
  price: number;
  selected: boolean;
}

interface ItemSelectorProps {
  ocrText: string;
  onCalculate: (selectedItems: LineItem[], totals: { subtotal: number; tax: number; tip: number; total: number }) => void;
  onBack: () => void;
}

export const ItemSelector = ({ ocrText, onCalculate, onBack }: ItemSelectorProps) => {
  const [items, setItems] = useState<LineItem[]>([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, tip: 0, total: 0 });
  const [isParsingComplete, setIsParsingComplete] = useState(false);

  // Enhanced parsing to extract English items and prices
  const parseReceiptText = () => {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const parsedItems: LineItem[] = [];
    let detectedTotals = { subtotal: 0, tax: 0, tip: 0, total: 0 };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines or very short lines
      if (trimmedLine.length < 2) return;
      
      // Look for totals/taxes (case insensitive)
      const lowerLine = trimmedLine.toLowerCase();
      
      if (lowerLine.includes('subtotal') || lowerLine.includes('sub total') || lowerLine.includes('sub-total')) {
        const match = trimmedLine.match(/[\$]?(\d+\.?\d*)/);
        if (match) detectedTotals.subtotal = parseFloat(match[1]);
        return;
      }
      if (lowerLine.includes('tax') && !lowerLine.includes('taxi')) {
        const match = trimmedLine.match(/[\$]?(\d+\.?\d*)/);
        if (match) detectedTotals.tax = parseFloat(match[1]);
        return;
      }
      if (lowerLine.includes('tip') || lowerLine.includes('gratuity') || lowerLine.includes('service')) {
        const match = trimmedLine.match(/[\$]?(\d+\.?\d*)/);
        if (match) detectedTotals.tip = parseFloat(match[1]);
        return;
      }
      if (lowerLine.includes('total') && !lowerLine.includes('subtotal')) {
        const match = trimmedLine.match(/[\$]?(\d+\.?\d*)/);
        if (match && parseFloat(match[1]) > detectedTotals.subtotal) {
          detectedTotals.total = parseFloat(match[1]);
        }
        return;
      }

      // Enhanced item detection - look for lines with English text + price
      const priceMatch = trimmedLine.match(/[\$]?(\d+\.?\d*)\s*$/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        if (price > 0 && price < 500) { // Reasonable price range for food items
          let itemText = trimmedLine.replace(priceMatch[0], '').trim();
          
          // Clean item name - remove leading numbers, quantities
          itemText = itemText.replace(/^\d+[\.\s]*/, ''); // Remove leading numbers like "1.", "2 "
          itemText = itemText.replace(/^\s*[\*\-\•]\s*/, ''); // Remove bullet points
          itemText = itemText.replace(/\$[\d\.]+/, ''); // Remove any dollar amounts
          itemText = itemText.replace(/^\d+x\s*/, ''); // Remove quantity like "2x "
          
          // Only include if it contains English letters and is meaningful
          if (itemText.length > 2 && /[a-zA-Z]/.test(itemText)) {
            // Clean up the item name further
            itemText = itemText.replace(/\s+/g, ' ').trim(); // Clean up spacing
            
            parsedItems.push({
              id: `item-${index}`,
              text: itemText,
              price,
              selected: false
            });
          }
        }
      }
    });

    // If no subtotal found, calculate from items
    if (detectedTotals.subtotal === 0 && parsedItems.length > 0) {
      detectedTotals.subtotal = parsedItems.reduce((sum, item) => sum + item.price, 0);
    }

    setItems(parsedItems);
    setTotals(detectedTotals);
    setIsParsingComplete(true);
  };

  const toggleItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const calculateMyShare = () => {
    const myItemsTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const billSubtotal = totals.subtotal || myItemsTotal;
    
    // Calculate my proportion of the bill
    const myProportion = billSubtotal > 0 ? myItemsTotal / billSubtotal : 0;
    
    // Proportionally split tax and tip
    const myTax = totals.tax * myProportion;
    const myTip = totals.tip * myProportion;
    
    // Calculate total amount I owe
    const myTotal = myItemsTotal + myTax + myTip;
    
    return {
      itemsTotal: myItemsTotal,
      tax: myTax,
      tip: myTip,
      total: myTotal,
      proportion: myProportion * 100
    };
  };

  const selectedItems = useMemo(() => 
    items.filter(item => item.selected), [items]
  );

  const myShare = calculateMyShare();

  const handleCalculate = () => {
    onCalculate(selectedItems, totals);
  };

  if (!isParsingComplete) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Receipt Text</h3>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">{ocrText}</pre>
          </div>
          <Button onClick={parseReceiptText} className="w-full">
            Parse Items
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Upload New Receipt
        </Button>
        <div className="text-sm text-muted-foreground">
          {items.length} items found
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Select Your Items
        </h3>
        
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground space-y-2">
              <p>No menu items detected in this receipt.</p>
              <p className="text-sm">Try uploading a clearer image or different receipt.</p>
            </div>
            <Button variant="outline" onClick={onBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Another Receipt
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`
                  flex items-center justify-between p-4 rounded-lg border transition-all duration-200
                  ${item.selected 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'hover:bg-muted/50 border-border'
                  }
                `}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{item.text}</span>
                  </div>
                </div>
                <Badge 
                  variant={item.selected ? "default" : "secondary"}
                  className="ml-3 font-medium"
                >
                  ${item.price.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedItems.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Your Payment Summary
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Your Items ({selectedItems.length}):</span>
                <span className="font-medium">${myShare.itemsTotal.toFixed(2)}</span>
              </div>
              
              {myShare.tax > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Your Share of Tax ({myShare.proportion.toFixed(1)}%):</span>
                  <span>${myShare.tax.toFixed(2)}</span>
                </div>
              )}
              
              {myShare.tip > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Your Share of Tip ({myShare.proportion.toFixed(1)}%):</span>
                  <span>${myShare.tip.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>You Pay:</span>
                  <Badge className="text-lg px-4 py-2">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {myShare.total.toFixed(2)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setItems(items.map(item => ({ ...item, selected: false })))}
                className="flex-1"
              >
                Clear Selection
              </Button>
              
              <Button onClick={handleCalculate} className="flex-1" size="lg">
                <Calculator className="w-4 h-4 mr-2" />
                Confirm Payment
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};