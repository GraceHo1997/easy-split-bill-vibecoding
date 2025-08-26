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
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    if (!googleVisionApiKey) {
      console.error('GOOGLE_VISION_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Google Vision API key is not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the image data from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Prepare the request for Google Vision API
    const visionRequest = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    console.log('Calling Google Vision API...');

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visionRequest),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process image with Google Vision API',
          details: errorText 
        }),
        {
          status: visionResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const visionData = await visionResponse.json();
    console.log('Google Vision API response received');

    // Extract text from the response
    let extractedText = '';
    if (visionData.responses && visionData.responses[0] && visionData.responses[0].fullTextAnnotation) {
      extractedText = visionData.responses[0].fullTextAnnotation.text || '';
    } else {
      console.log('No text detected in image');
      extractedText = 'No text could be detected in this image. Please try with a clearer receipt image.';
    }

    console.log('OCR extraction completed, text length:', extractedText.length);

    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText,
        filename: file.name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in process-receipt function:', error);
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