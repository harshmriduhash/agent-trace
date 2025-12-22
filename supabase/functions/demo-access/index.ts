import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { name, email, company, role, evaluation_notes } = await req.json();

    // Validate required fields
    if (!name || !email || !company || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, company, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create demo session
    const { data: session, error } = await supabase
      .from('demo_sessions')
      .insert({
        name,
        email,
        company,
        role,
        evaluation_notes: evaluation_notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating demo session:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create demo session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Demo session created for ${email} at ${company}`);

    return new Response(
      JSON.stringify({
        demo_session_id: session.id,
        expires_at: session.expires_at,
        message: 'Demo access granted. Session valid for 48 hours.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in demo-access:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
