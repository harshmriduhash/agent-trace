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

    // Get run ID from URL
    const url = new URL(req.url);
    const runId = url.searchParams.get('run_id');
    
    if (!runId) {
      return new Response(
        JSON.stringify({ error: 'Missing run_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .select('id')
      .eq('id', demoSessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid demo session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get run details
    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('id', runId)
      .eq('demo_session_id', demoSessionId)
      .single();

    if (runError || !run) {
      return new Response(
        JSON.stringify({ error: 'Run not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get steps
    const { data: steps, error: stepsError } = await supabase
      .from('agent_steps')
      .select('*')
      .eq('agent_run_id', runId)
      .order('step_index', { ascending: true });

    if (stepsError) {
      console.error('Error fetching steps:', stepsError);
    }

    // Calculate step metrics
    const totalLatency = steps?.reduce((acc, s) => acc + (s.latency_ms || 0), 0) || 0;
    const avgStepConfidence = steps && steps.length > 0
      ? steps.reduce((acc, s) => acc + (s.confidence || 0), 0) / steps.length
      : 0;
    const lowConfidenceSteps = steps?.filter(s => (s.confidence || 0) < 0.6).length || 0;
    const highLatencySteps = steps?.filter(s => (s.latency_ms || 0) > 500).length || 0;

    return new Response(
      JSON.stringify({
        run,
        steps: steps || [],
        metrics: {
          total_latency_ms: totalLatency,
          avg_step_confidence: avgStepConfidence,
          steps_count: steps?.length || 0,
          low_confidence_steps: lowConfidenceSteps,
          high_latency_steps: highLatencySteps,
          can_replay: run.replay_count === 0,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in run-details:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
