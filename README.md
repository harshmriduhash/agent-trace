# AgentTrace — Agent Observability Platform

> "Datadog for AI Agents" — Debug, trace, and replay AI agent executions at step-level granularity.

![Platform Type](https://img.shields.io/badge/Platform-Internal%20MVP-blue)
![Status](https://img.shields.io/badge/Status-Production--Ready-green)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## 🎯 What Is This?

AgentTrace is an **internal, demo-gated, single-tenant observability platform** designed to solve the core problem engineering teams face when deploying AI agents:

- ❌ Cannot debug agent failures
- ❌ Cannot trace reasoning or tool usage
- ❌ Cannot replay executions
- ❌ Cannot measure reliability

**This is NOT a SaaS product.** It's a production-style system meant to:
1. Demonstrate deep engineering capability
2. Generate high-intent technical leads
3. Serve as an engineering case study

---

## 👥 Who Is This For?

### Target Users
| Role | Use Case |
|------|----------|
| **ML Engineers** | Debug agent failures, trace tool calls, analyze confidence scores |
| **Platform Teams** | Monitor agent reliability, measure latency, track token usage |
| **Engineering Leaders** | Evaluate observability solutions for AI agent deployments |

### Demo Users (Lead Capture)
- CTOs evaluating agent infrastructure
- Founders building AI-first products
- Engineers researching observability tools

---

## ✨ Core Features

### 1. Step-Level Execution Tracing
Every agent execution is captured with granular step-by-step traces:
- **Prompt processing** — Initial input handling
- **Tool calls** — External API/function invocations
- **Tool results** — Response data from tools
- **Reasoning** — Intermediate decision-making
- **Output** — Final agent response

### 2. Execution Replay
Re-run any agent execution with:
- Same inputs
- Same tools
- Same model version
- One replay per run (enforced)

### 3. Failure & Confidence Signals
Automatic detection of:
- ⛔ Failures and timeouts
- ⚠️ Low confidence outputs (<0.6)
- 🐌 High latency steps (>500ms)

### 4. Metrics Dashboard
Real-time visibility into:
- Total runs and success/failure rates
- Average confidence scores
- Token usage patterns
- Latency distribution

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + TypeScript + Tailwind CSS + shadcn/ui              │
├─────────────────────────────────────────────────────────────┤
│                      Edge Functions                          │
│  Supabase Edge Functions (TypeScript/Deno)                  │
│  ├── demo-access     → Lead capture & session creation      │
│  ├── agent-run       → Trigger & wrap agent execution       │
│  ├── agent-runs      → List runs with metrics               │
│  ├── run-details     → Step-level trace retrieval           │
│  └── replay-run      → Re-execute with same parameters      │
├─────────────────────────────────────────────────────────────┤
│                        Database                              │
│  Supabase PostgreSQL                                         │
│  ├── demo_sessions   → Lead data + session tokens           │
│  ├── agent_runs      → Execution metadata                   │
│  └── agent_steps     → Step-level traces (JSONB)            │
├─────────────────────────────────────────────────────────────┤
│                      AI Execution                            │
│  Lovable AI Gateway (Gemini 2.5 Flash)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + TypeScript | Type-safe, component-based UI |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, dark theme support |
| **Routing** | React Router v6 | SPA navigation |
| **State** | TanStack Query | Server state management |
| **Backend** | Supabase Edge Functions | Serverless TypeScript/Deno runtime |
| **Database** | Supabase PostgreSQL | Relational with JSONB for flexible schemas |
| **AI** | Lovable AI Gateway | Managed AI model access |
| **Rate Limiting** | Database counters | Simple, no Redis dependency |

---

## 📊 Data Model

### `demo_sessions`
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
email           TEXT NOT NULL
company         TEXT NOT NULL
role            TEXT NOT NULL
evaluation_notes TEXT
expires_at      TIMESTAMP (48 hours from creation)
run_count       INTEGER (max 5)
created_at      TIMESTAMP
```

### `agent_runs`
```sql
id              UUID PRIMARY KEY
demo_session_id UUID REFERENCES demo_sessions
agent_name      TEXT DEFAULT 'Research Agent'
status          ENUM (pending, running, success, failed, timeout)
confidence_score FLOAT
started_at      TIMESTAMP
completed_at    TIMESTAMP
token_usage     INTEGER
input_query     TEXT
error_message   TEXT
replay_count    INTEGER (max 1)
```

### `agent_steps`
```sql
id              UUID PRIMARY KEY
agent_run_id    UUID REFERENCES agent_runs
step_index      INTEGER
step_type       ENUM (prompt, tool_call, tool_result, reasoning, output)
input           JSONB
output          JSONB
latency_ms      INTEGER
confidence      FLOAT
created_at      TIMESTAMP
```

---

## 🔐 Access Model

### Demo Gate (Not Authentication)
This platform uses **demo-gated access**, NOT traditional authentication:

1. User fills out lead capture form (name, email, company, role)
2. System creates `demo_session` with UUID token
3. Token stored in localStorage, sent via `X-Demo-Session` header
4. Session expires after 48 hours
5. Max 5 agent runs per session

**Why no auth?**
- This is an internal demo platform, not a multi-tenant SaaS
- Lead capture is the goal, not user management
- Simplifies architecture while preventing abuse

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/functions/v1/demo-access` | POST | Create demo session |
| `/functions/v1/agent-run` | POST | Trigger agent execution |
| `/functions/v1/agent-runs` | GET | List all runs for session |
| `/functions/v1/run-details?run_id=` | GET | Get run with steps |
| `/functions/v1/replay-run` | POST | Replay a run (once) |

All endpoints (except `demo-access`) require `X-Demo-Session` header.

---

## 🚦 Rate Limiting

| Limit | Value | Enforcement |
|-------|-------|-------------|
| Agent runs per session | 5 | Database counter |
| Replay per run | 1 | Database flag |
| Session duration | 48 hours | Timestamp comparison |

---

## 🎨 Design Philosophy

The UI is intentionally **minimal and production-grade**:
- Dark theme (internal tool aesthetic)
- No marketing fluff
- Tables over cards where data density matters
- JSON views for technical users
- Status badges with semantic colors

**This should feel like:** An internal platform team's pre-production system  
**NOT like:** A startup landing page, toy demo, or polished SaaS

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   ├── pages/
│   │   ├── DemoGate.tsx     # Lead capture form
│   │   ├── Dashboard.tsx    # Runs table + metrics
│   │   └── RunDetail.tsx    # Step-level trace view
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   └── integrations/
│       └── supabase/        # Auto-generated types & client
├── supabase/
│   ├── functions/
│   │   ├── demo-access/     # Session creation
│   │   ├── agent-run/       # Execution wrapper
│   │   ├── agent-runs/      # List endpoint
│   │   ├── run-details/     # Detail endpoint
│   │   └── replay-run/      # Replay endpoint
│   └── config.toml          # Function configuration
├── public/                  # Static assets
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (auto-configured via Lovable Cloud)

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Auto-configured by Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 🧪 Demo Agent

The platform includes a **Research Agent** that demonstrates:
1. Query understanding (prompt step)
2. Information retrieval (tool_call + tool_result)
3. Synthesis and reasoning (reasoning step)
4. Response generation (output step)

Each step is captured with:
- Timestamps and latency
- Input/output payloads (JSONB)
- Confidence scores
- Step type classification

---

## 📈 Metrics & Signals

### Success Indicators
- ✅ Status: `success`
- ✅ Confidence: ≥0.6
- ✅ Latency: <500ms per step

### Warning Signals
- ⚠️ Low confidence: <0.6
- ⚠️ High latency: >500ms
- ⚠️ High token usage

### Failure Indicators
- ❌ Status: `failed` or `timeout`
- ❌ Error message present
- ❌ Incomplete step traces

---

## 🔮 Future Considerations

These are explicitly **NOT in scope** for this MVP:
- ❌ User authentication (passwords, signup/login)
- ❌ Multi-tenant organization management
- ❌ UI polish or marketing pages
- ❌ Billing or subscription management
- ❌ Email verification or notifications

---

## 📝 Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No Redis | Database counters | Platform constraint, sufficient for demo scale |
| No FastAPI | Edge Functions | Lovable platform uses Supabase/Deno |
| JSONB for steps | Flexible schema | Agent outputs vary widely |
| 48-hour sessions | Time-limited access | Lead urgency without account overhead |
| 5-run limit | Rate limiting | Prevent abuse, create scarcity |

---

## 🤝 Contributing

This is an internal platform. For modifications:
1. Understand the access model (demo-gated, not auth)
2. Maintain the minimal aesthetic
3. Preserve step-level tracing fidelity
4. Test rate limiting behavior

---

## 📄 License

Proprietary — Internal use only.

---

**Built with [Lovable](https://lovable.dev)** — The AI-powered full-stack development platform.
