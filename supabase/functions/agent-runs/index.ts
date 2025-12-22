import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-demo-session',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const demoSessionId = req.headers.get('x-demo-session');
    if (!demoSessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing X-Demo-Session header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .select('id, expires_at')
      .eq('id', demoSessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid demo session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all runs for this session
    const { data: runs, error: runsError } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('demo_session_id', demoSessionId)
      .order('created_at', { ascending: false });

    if (runsError) {
      console.error('Error fetching runs:', runsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch runs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate metrics
    const totalRuns = runs?.length || 0;
    const successRuns = runs?.filter(r => r.status === 'success').length || 0;
    const failedRuns = runs?.filter(r => r.status === 'failed' || r.status === 'timeout').length || 0;
    const avgConfidence = totalRuns > 0 
      ? runs.reduce((acc, r) => acc + (r.confidence_score || 0), 0) / totalRuns 
      : 0;
    const avgTokens = totalRuns > 0
      ? runs.reduce((acc, r) => acc + (r.token_usage || 0), 0) / totalRuns
      : 0;

    return new Response(
      JSON.stringify({
        runs: runs || [],
        metrics: {
          total_runs: totalRuns,
          success_count: successRuns,
          failure_count: failedRuns,
          failure_rate: totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0,
          avg_confidence: avgConfidence,
          avg_token_usage: avgTokens,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in agent-runs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
