import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Calculator, Users } from 'lucide-react';

interface CalculationModeSelectorProps {
  onModeSelect: (mode: 'individual' | 'shared') => void;
  onBack: () => void;
}

export const CalculationModeSelector: React.FC<CalculationModeSelectorProps> = ({ onModeSelect, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Choose Calculation Method</h2>
      </div>

      <div className="space-y-4">
        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => onModeSelect('individual')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calculator className="h-5 w-5" />
              Individual Item Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get the exact cost for each individual item (including proportional tax and tip).
              Perfect when you want to know how much each item costs separately.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => onModeSelect('shared')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              Shared Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Select items you ordered and specify how many people share each item.
              Great for splitting bills when items are shared among multiple people.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};