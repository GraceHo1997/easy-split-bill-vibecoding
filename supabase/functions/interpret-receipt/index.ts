import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { ocrText } = await req.json();
    
    if (!ocrText) {
      return new Response(
        JSON.stringify({ error: 'No OCR text provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Interpreting OCR text with OpenAI...');

    // Call OpenAI API to interpret the receipt
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional receipt parser. Carefully analyze receipt text and identify all food items and prices.

Rules:
1. Find ALL food items and their corresponding prices (DO NOT remove duplicates)
2. Item names should be complete and meaningful (remove numbers, quantities)
3. Prices must have $ symbol
4. Identify subtotal, tax, tip, and total
5. Return JSON format only, no other text

JSON format:
{
  "items": [
    {
      "name": "Item name",
      "price": number (without $ symbol)
    }
  ],
  "subtotal": number,
  "tax": number,
  "tip": number,
  "total": number
}`
          },
          {
            role: 'user',
            content: `Please parse this receipt:\n\n${ocrText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to interpret receipt with OpenAI',
          details: errorText 
        }),
        {
          status: openAIResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received');

    // Extract the interpretation from OpenAI response
    let interpretation;
    try {
      const content = openAIData.choices[0].message.content.trim();
      // Remove markdown code block if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      interpretation = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse OpenAI response',
          details: parseError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Receipt interpretation completed');

    return new Response(
      JSON.stringify({
        success: true,
        interpretation: interpretation,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in interpret-receipt function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});