import { useState } from 'react';
import { ReceiptUpload } from '@/components/ReceiptUpload';
import { ItemSelector } from '@/components/ItemSelector';
import { PaymentSummary } from '@/components/PaymentSummary';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, Users, Calculator, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LineItem {
  id: string;
  text: string;
  price: number;
  selected: boolean;
}

type Step = 'upload' | 'select' | 'summary';

const Index = () => {
  console.log('Index component is rendering...');
  
  // Simple test first
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '24px' }}>Expense Clarify Test</h1>
      <p style={{ color: 'gray' }}>If you can see this, the basic component is working.</p>
      <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
        <p>Upload area will go here</p>
        <p>Console should show: "Index component is rendering..."</p>
      </div>
    </div>
  );
};

export default Index;