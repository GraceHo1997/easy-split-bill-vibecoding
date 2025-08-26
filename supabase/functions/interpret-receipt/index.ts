import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
            content: `你是一個專業的收據解析助手。請仔細分析收據文字，識別餐點品項和價格。

規則：
1. 找出所有餐點品項名稱和對應價格
2. 品項名稱要完整且有意義（去除數字、數量等）
3. 價格前面一定有 $ 符號
4. 識別 subtotal（小計）、tax（稅）、tip（小費）、total（總計）
5. 回傳��� JSON 格式，不要其他文字

JSON 格式：
{
  "items": [
    {
      "name": "品項名稱",
      "price": 數字（不含$符號）
    }
  ],
  "subtotal": 數字,
  "tax": 數字,
  "tip": 數字,
  "total": 數字
}`
          },
          {
            role: 'user',
            content: `請解析這張收據：\n\n${ocrText}`
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