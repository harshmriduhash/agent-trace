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

    const { run_id } = await req.json();
    if (!run_id) {
      return new Response(
        JSON.stringify({ error: 'Missing run_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .select('id, run_count')
      .eq('id', demoSessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid demo session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get original run
    const { data: originalRun, error: runError } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('id', run_id)
      .eq('demo_session_id', demoSessionId)
      .single();

    if (runError || !originalRun) {
      return new Response(
        JSON.stringify({ error: 'Run not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check replay limit
    if (originalRun.replay_count >= 1) {
      return new Response(
        JSON.stringify({ error: 'Run has already been replayed once' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get original steps
    const { data: originalSteps, error: stepsError } = await supabase
      .from('agent_steps')
      .select('*')
      .eq('agent_run_id', run_id)
      .order('step_index', { ascending: true });

    if (stepsError) {
      console.error('Error fetching original steps:', stepsError);
    }

    // Create new replayed run
    const { data: newRun, error: newRunError } = await supabase
      .from('agent_runs')
      .insert({
        demo_session_id: demoSessionId,
        agent_name: originalRun.agent_name,
        status: 'running',
        input_query: originalRun.input_query,
      })
      .select()
      .single();

    if (newRunError) {
      console.error('Error creating replay run:', newRunError);
      return new Response(
        JSON.stringify({ error: 'Failed to create replay run' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark original as replayed
    await supabase
      .from('agent_runs')
      .update({ replay_count: originalRun.replay_count + 1 })
      .eq('id', run_id);

    // Increment session run count
    await supabase
      .from('demo_sessions')
      .update({ run_count: session.run_count + 1 })
      .eq('id', demoSessionId);

    // Create replayed steps with slight variations
    const replayedSteps = originalSteps?.map((step, index) => ({
      agent_run_id: newRun.id,
      step_index: step.step_index,
      step_type: step.step_type,
      tool_name: step.tool_name,
      input: step.input,
      output: step.output,
      latency_ms: Math.round((step.latency_ms || 100) * (0.9 + Math.random() * 0.2)), // ±10% variation
      confidence: Math.min(1, Math.max(0, (step.confidence || 0.8) + (Math.random() * 0.1 - 0.05))), // ±5% variation
    })) || [];

    if (replayedSteps.length > 0) {
      await supabase.from('agent_steps').insert(replayedSteps);
    }

    // Calculate metrics
    const totalLatency = replayedSteps.reduce((acc, s) => acc + (s.latency_ms || 0), 0);
    const avgConfidence = replayedSteps.length > 0
      ? replayedSteps.reduce((acc, s) => acc + (s.confidence || 0), 0) / replayedSteps.length
      : 0;

    // Update replayed run
    await supabase
      .from('agent_runs')
      .update({
        status: 'success',
        confidence_score: avgConfidence,
        completed_at: new Date().toISOString(),
        token_usage: originalRun.token_usage,
      })
      .eq('id', newRun.id);

    console.log(`Replayed run ${run_id} as ${newRun.id}`);

    return new Response(
      JSON.stringify({
        original_run_id: run_id,
        replayed_run_id: newRun.id,
        status: 'success',
        confidence_score: avgConfidence,
        total_latency_ms: totalLatency,
        steps_count: replayedSteps.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in replay-run:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
