// path: supabase/functions/get-gemini-token/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

serve(async (req) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        if (!GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY is not set in Edge Function Secrets.');
        }

        // 1. Request Ephemeral Token from Google
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/tokens?key=${GOOGLE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ttl: "3600s",
                    target_audiences: ["https://generativelanguage.googleapis.com"]
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Google API Error (${response.status}):`, errorText);
            throw new Error(`Google API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // 2. Return the Access Token to Flutter
        return new Response(
            JSON.stringify({
                accessToken: data.access_token,
                expirationTime: data.expiration_time
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
