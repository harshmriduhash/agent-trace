
-- Create enums for status and step types
CREATE TYPE run_status AS ENUM ('pending', 'running', 'success', 'failed', 'timeout');
CREATE TYPE step_type AS ENUM ('prompt', 'tool_call', 'tool_result', 'reasoning', 'output');

-- Demo sessions table (lead capture + session management)
CREATE TABLE public.demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  evaluation_notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '48 hours'),
  run_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent runs table
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_session_id UUID NOT NULL REFERENCES public.demo_sessions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL DEFAULT 'Research Agent',
  status run_status NOT NULL DEFAULT 'pending',
  confidence_score FLOAT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  token_usage INT DEFAULT 0,
  error_message TEXT,
  input_query TEXT,
  replay_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent steps table (granular execution trace)
CREATE TABLE public.agent_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id UUID NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  step_index INT NOT NULL,
  step_type step_type NOT NULL,
  tool_name TEXT,
  input JSONB,
  output JSONB,
  latency_ms INT,
  confidence FLOAT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_agent_runs_demo_session ON public.agent_runs(demo_session_id);
CREATE INDEX idx_agent_runs_status ON public.agent_runs(status);
CREATE INDEX idx_agent_steps_run ON public.agent_steps(agent_run_id);
CREATE INDEX idx_agent_steps_order ON public.agent_steps(agent_run_id, step_index);
CREATE INDEX idx_demo_sessions_email ON public.demo_sessions(email);
CREATE INDEX idx_demo_sessions_expires ON public.demo_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public access for demo (no auth required)
-- Demo sessions: anyone can create, read their own via session token
CREATE POLICY "Allow insert demo sessions" ON public.demo_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read demo sessions by id" ON public.demo_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow update demo sessions" ON public.demo_sessions
  FOR UPDATE USING (true);

-- Agent runs: accessible via demo session
CREATE POLICY "Allow insert agent runs" ON public.agent_runs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read agent runs" ON public.agent_runs
  FOR SELECT USING (true);

CREATE POLICY "Allow update agent runs" ON public.agent_runs
  FOR UPDATE USING (true);

-- Agent steps: accessible via agent run
CREATE POLICY "Allow insert agent steps" ON public.agent_steps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read agent steps" ON public.agent_steps
  FOR SELECT USING (true);
