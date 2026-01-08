import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Zap, Eye, RotateCcw, Shield, BarChart3, Play, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-accent/10 via-transparent to-transparent blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />

        <div className="container relative z-10 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                to="/changelog" 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-secondary/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all mb-8"
              >
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                Now in Public Beta
                <ChevronRight className="h-3 w-3" />
              </Link>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              Observability for{" "}
              <span className="text-gradient">AI Agents</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Debug, trace, and replay AI agent executions with step-level granularity. 
              Finally understand why your agents fail.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild className="rounded-full px-8 h-12 text-base btn-glow">
                <Link to="/auth?mode=signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base border-border/50 hover:bg-secondary">
                <Link to="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>

            {/* Trust Signals */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-muted-foreground mt-6"
            >
              No credit card required • Free 14-day trial • Cancel anytime
            </motion.p>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">agenttrace.io/dashboard</span>
              </div>
              <div className="p-8 space-y-4">
                {/* Mock metrics row */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Total Runs", value: "2,847" },
                    { label: "Success Rate", value: "94.2%" },
                    { label: "Avg Latency", value: "1.2s" },
                    { label: "Tokens Used", value: "1.2M" },
                  ].map((metric, i) => (
                    <div key={i} className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                      <p className="text-2xl font-semibold">{metric.value}</p>
                    </div>
                  ))}
                </div>
                {/* Mock runs list */}
                <div className="space-y-2">
                  {[
                    { status: "success", query: "Research competitor pricing strategies", confidence: "96%" },
                    { status: "success", query: "Summarize Q4 financial reports", confidence: "91%" },
                    { status: "failed", query: "Generate market analysis report", confidence: "23%" },
                  ].map((run, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${run.status === 'success' ? 'bg-success' : 'bg-destructive'}`} />
                        <span className="text-sm">{run.query}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{run.confidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logo Carousel */}
      <section className="py-16 border-y border-border/30 bg-secondary/20 overflow-hidden">
        <div className="container mb-8">
          <p className="text-center text-sm text-muted-foreground">Trusted by engineering teams at</p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex items-center gap-16 px-8 shrink-0">
                {["OpenAI", "Anthropic", "Cohere", "Mistral", "DeepMind", "Meta AI", "Stability AI", "Hugging Face"].map((name, i) => (
                  <div key={i} className="text-xl font-semibold text-muted-foreground/40 whitespace-nowrap">
                    {name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent opacity-30" />
        <div className="container relative z-10">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Everything you need to{" "}
              <span className="text-gradient">debug AI agents</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Comprehensive tooling for engineering teams deploying production AI agents.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Eye className="h-6 w-6" />,
                title: "Step-Level Traces",
                description: "See every decision your agent makes. Inspect prompts, tool calls, reasoning, and outputs with full context."
              },
              {
                icon: <RotateCcw className="h-6 w-6" />,
                title: "Execution Replay",
                description: "Re-run any agent execution with the same inputs, tools, and model version to reproduce issues."
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Real-time Metrics",
                description: "Monitor latency, confidence scores, token usage, and failure rates as they happen."
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Failure Detection",
                description: "Automatic detection of failures, timeouts, low confidence, and anomalous behavior patterns."
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Analytics Dashboard",
                description: "Visualize agent performance trends and identify reliability issues before they impact users."
              },
              {
                icon: <Play className="h-6 w-6" />,
                title: "Multi-Agent Support",
                description: "Track complex workflows across multiple interacting agents with unified tracing."
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-border transition-all card-hover"
              >
                <div className="p-3 rounded-xl bg-secondary w-fit mb-5 group-hover:bg-accent/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-secondary/20 border-y border-border/30">
        <div className="container">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Get started in minutes
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Our lightweight SDK integrates with any agent framework.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Install SDK", description: "Add our SDK wrapper around your agent execution with a single line of code." },
              { step: "02", title: "Execute & Capture", description: "Every step is automatically captured with timestamps, inputs, outputs, and confidence." },
              { step: "03", title: "Debug & Replay", description: "Inspect traces, identify failures, and replay executions to reproduce and fix issues." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-muted-foreground/20 mb-4">{item.step}</div>
                <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent/10 via-transparent to-transparent" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to debug your AI agents?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join engineering teams who trust AgentTrace for production agent observability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="rounded-full px-8 h-12 text-base btn-glow">
                <Link to="/auth?mode=signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base border-border/50">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
