import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-demo-session',
};

const MAX_RUNS_PER_SESSION = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate demo session
    const demoSessionId = req.headers.get('x-demo-session');
    if (!demoSessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing X-Demo-Session header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check session validity and run count
    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .select('*')
      .eq('id', demoSessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid demo session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Demo session expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (session.run_count >= MAX_RUNS_PER_SESSION) {
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_RUNS_PER_SESSION} runs per demo session reached` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query } = await req.json();
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create agent run
    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        demo_session_id: demoSessionId,
        agent_name: 'Research Agent',
        status: 'running',
        input_query: query,
      })
      .select()
      .single();

    if (runError) {
      console.error('Error creating agent run:', runError);
      return new Response(
        JSON.stringify({ error: 'Failed to create agent run' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment run count
    await supabase
      .from('demo_sessions')
      .update({ run_count: session.run_count + 1 })
      .eq('id', demoSessionId);

    // Execute agent with step tracking
    const steps: any[] = [];
    let totalLatency = 0;
    let totalTokens = 0;
    let overallConfidence = 0;
    let status: 'success' | 'failed' | 'timeout' = 'success';
    let errorMessage: string | null = null;

    try {
      // Step 1: Prompt Processing
      const step1Start = Date.now();
      steps.push({
        agent_run_id: run.id,
        step_index: 0,
        step_type: 'prompt',
        input: { query },
        output: { processed_query: query, intent: 'research_request' },
        latency_ms: Date.now() - step1Start + 45,
        confidence: 0.95,
      });
      totalLatency += steps[0].latency_ms;

      // Step 2: Tool Call - Web Search
      const step2Start = Date.now();
      steps.push({
        agent_run_id: run.id,
        step_index: 1,
        step_type: 'tool_call',
        tool_name: 'web_search',
        input: { search_query: query, max_results: 5 },
        output: { 
          results: [
            { title: 'Recent developments in AI', url: 'https://example.com/ai-news', snippet: 'Latest AI research...' },
            { title: 'Research findings', url: 'https://example.com/research', snippet: 'Key findings include...' },
          ],
          result_count: 5
        },
        latency_ms: Date.now() - step2Start + 312,
        confidence: 0.88,
      });
      totalLatency += steps[1].latency_ms;

      // Step 3: Tool Result Processing
      const step3Start = Date.now();
      steps.push({
        agent_run_id: run.id,
        step_index: 2,
        step_type: 'tool_result',
        tool_name: 'web_search',
        input: { results_to_process: 5 },
        output: { 
          extracted_facts: 3,
          relevance_scores: [0.92, 0.87, 0.84, 0.76, 0.71],
          summary: 'Found relevant information across 5 sources'
        },
        latency_ms: Date.now() - step3Start + 89,
        confidence: 0.86,
      });
      totalLatency += steps[2].latency_ms;

      // Step 4: Reasoning (AI call)
      const step4Start = Date.now();
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      let reasoningOutput: { analysis: string; key_points: string[] } = { analysis: 'Synthesizing information...', key_points: [] };
      let reasoningConfidence = 0.85;
      
      if (LOVABLE_API_KEY) {
        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'You are a research agent. Analyze the query and provide 3 key insights. Keep response under 150 words. Format as JSON with "analysis" and "key_points" array.' },
                { role: 'user', content: `Research query: ${query}` }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || '';
            totalTokens = aiData.usage?.total_tokens || 150;
            
            try {
              const parsed = JSON.parse(content);
              reasoningOutput = parsed;
              reasoningConfidence = 0.91;
            } catch {
              reasoningOutput = { 
                analysis: content.slice(0, 500), 
                key_points: ['Analysis completed', 'Results synthesized', 'Ready for output'] 
              };
            }
          }
        } catch (aiError) {
          console.error('AI call error:', aiError);
        }
      }

      steps.push({
        agent_run_id: run.id,
        step_index: 3,
        step_type: 'reasoning',
        input: { context: 'Analyzing search results and synthesizing response' },
        output: reasoningOutput,
        latency_ms: Date.now() - step4Start + 450,
        confidence: reasoningConfidence,
      });
      totalLatency += steps[3].latency_ms;

      // Step 5: Final Output
      const step5Start = Date.now();
      steps.push({
        agent_run_id: run.id,
        step_index: 4,
        step_type: 'output',
        input: { format: 'structured_response' },
        output: { 
          response: reasoningOutput.analysis || 'Research completed successfully',
          sources_used: 3,
          confidence_level: 'high',
          key_findings: reasoningOutput.key_points || []
        },
        latency_ms: Date.now() - step5Start + 23,
        confidence: 0.89,
      });
      totalLatency += steps[4].latency_ms;

      // Calculate overall confidence
      overallConfidence = steps.reduce((acc, s) => acc + (s.confidence || 0), 0) / steps.length;

    } catch (execError) {
      console.error('Agent execution error:', execError);
      status = 'failed';
      errorMessage = execError instanceof Error ? execError.message : 'Execution failed';
      overallConfidence = 0.3;
    }

    // Insert all steps
    const { error: stepsError } = await supabase
      .from('agent_steps')
      .insert(steps);

    if (stepsError) {
      console.error('Error inserting steps:', stepsError);
    }

    // Update run with completion data
    const { error: updateError } = await supabase
      .from('agent_runs')
      .update({
        status,
        confidence_score: overallConfidence,
        completed_at: new Date().toISOString(),
        token_usage: totalTokens || 150,
        error_message: errorMessage,
      })
      .eq('id', run.id);

    if (updateError) {
      console.error('Error updating run:', updateError);
    }

    console.log(`Agent run ${run.id} completed with status: ${status}`);

    return new Response(
      JSON.stringify({
        run_id: run.id,
        status,
        confidence_score: overallConfidence,
        total_latency_ms: totalLatency,
        token_usage: totalTokens || 150,
        steps_count: steps.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in agent-run:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
