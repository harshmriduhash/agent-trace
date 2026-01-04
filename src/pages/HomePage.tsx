import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Activity, Zap, Eye, RotateCcw, Shield, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Now in Public Beta
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Observability for{" "}
              <span className="text-primary">AI Agents</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Debug, trace, and replay AI agent executions at step-level granularity. 
              Finally understand why your agents fail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth?mode=signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">View Demo</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to debug AI agents
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tooling for engineering teams deploying production AI agents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Eye className="h-6 w-6" />}
              title="Step-Level Traces"
              description="See every decision your agent makes. Inspect prompts, tool calls, reasoning, and outputs."
            />
            <FeatureCard
              icon={<RotateCcw className="h-6 w-6" />}
              title="Execution Replay"
              description="Re-run any agent execution with the same inputs, tools, and model version."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Real-time Metrics"
              description="Monitor latency, confidence scores, token usage, and failure rates in real-time."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Failure Detection"
              description="Automatic detection of failures, timeouts, low confidence, and high latency."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analytics Dashboard"
              description="Visualize agent performance trends and identify reliability issues."
            />
            <FeatureCard
              icon={<Activity className="h-6 w-6" />}
              title="Multi-Agent Support"
              description="Track complex workflows across multiple interacting agents."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started in minutes with our lightweight SDK.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Wrap Your Agent"
              description="Add our SDK wrapper around your agent execution with a single line of code."
            />
            <StepCard
              number="2"
              title="Execute & Capture"
              description="Every step is automatically captured with timestamps, inputs, outputs, and confidence."
            />
            <StepCard
              number="3"
              title="Debug & Replay"
              description="Inspect traces, identify failures, and replay executions to reproduce issues."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to debug your AI agents?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join engineering teams who trust AgentTrace for production agent observability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth?mode=signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Free 14-day trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="bg-card border-border hover:border-primary/50 transition-colors">
    <CardContent className="p-6">
      <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="text-center">
    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default HomePage;
