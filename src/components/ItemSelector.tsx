import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign } from 'lucide-react';

interface LineItem {
  id: string;
  text: string;
  price: number;
  selected: boolean;
}

interface ItemSelectorProps {
  ocrText: string;
  onCalculate: (selectedItems: LineItem[], totals: { subtotal: number; tax: number; tip: number; total: number }) => void;
}

export const ItemSelector = ({ ocrText, onCalculate }: ItemSelectorProps) => {
  const [items, setItems] = useState<LineItem[]>([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, tip: 0, total: 0 });
  const [isParsingComplete, setIsParsingComplete] = useState(false);

  // Parse OCR text to extract items and prices
  const parseReceiptText = () => {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const priceRegex = /\$?(\d+\.?\d*)/g;
    const parsedItems: LineItem[] = [];
    let detectedTotals = { subtotal: 0, tax: 0, tip: 0, total: 0 };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines or very short lines
      if (trimmedLine.length < 3) return;
      
      // Look for totals/taxes
      const lowerLine = trimmedLine.toLowerCase();
      if (lowerLine.includes('subtotal') || lowerLine.includes('sub total')) {
        const match = trimmedLine.match(/\$?(\d+\.?\d*)/);
        if (match) detectedTotals.subtotal = parseFloat(match[1]);
        return;
      }
      if (lowerLine.includes('tax')) {
        const match = trimmedLine.match(/\$?(\d+\.?\d*)/);
        if (match) detectedTotals.tax = parseFloat(match[1]);
        return;
      }
      if (lowerLine.includes('tip') || lowerLine.includes('gratuity')) {
        const match = trimmedLine.match(/\$?(\d+\.?\d*)/);
        if (match) detectedTotals.tip = parseFloat(match[1]);
        return;
      }
      if (lowerLine.includes('total')) {
        const match = trimmedLine.match(/\$?(\d+\.?\d*)/);
        if (match) detectedTotals.total = parseFloat(match[1]);
        return;
      }

      // Look for item lines with prices
      const priceMatches = trimmedLine.match(priceRegex);
      if (priceMatches && priceMatches.length > 0) {
        const price = parseFloat(priceMatches[priceMatches.length - 1].replace('$', ''));
        if (price > 0 && price < 1000) { // Reasonable price range
          const itemText = trimmedLine.replace(priceMatches[priceMatches.length - 1], '').trim();
          if (itemText.length > 2) {
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

    setItems(parsedItems);
    setTotals(detectedTotals);
    setIsParsingComplete(true);
  };

  const toggleItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedItems = useMemo(() => 
    items.filter(item => item.selected), [items]
  );

  const selectedTotal = useMemo(() => 
    selectedItems.reduce((sum, item) => sum + item.price, 0), [selectedItems]
  );

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
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Your Items</h3>
        
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No items found in the receipt.</p>
            <p className="text-sm mt-2">You may need to manually review the OCR text above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                  ${item.selected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <span className="font-medium">{item.text}</span>
                </div>
                <Badge variant={item.selected ? "default" : "secondary"}>
                  ${item.price.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedItems.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Selected Items Total</h4>
              <Badge variant="outline" className="text-lg px-3 py-1">
                <DollarSign className="w-4 h-4 mr-1" />
                {selectedTotal.toFixed(2)}
              </Badge>
            </div>

            {totals.total > 0 && (
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Bill Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                )}
                {totals.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span>${totals.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total Bill:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate My Share
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};