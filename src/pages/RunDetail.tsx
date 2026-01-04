import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { ArrowLeft, RotateCcw, Clock, Zap, Target, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Step {
  id: string;
  step_index: number;
  step_type: string;
  tool_name: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  latency_ms: number;
  confidence: number;
}

interface Run {
  id: string;
  agent_name: string;
  status: string;
  confidence_score: number;
  started_at: string;
  completed_at: string;
  token_usage: number;
  input_query: string;
  error_message: string | null;
  replay_count: number;
}

const RunDetail = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [run, setRun] = useState<Run | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (session?.access_token) {
      fetchDetails();
    }
  }, [runId, session]);

  const fetchDetails = async () => {
    try {
      // Fetch run
      const runResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_runs?id=eq.${runId}&select=*`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );
      const runData = await runResponse.json();
      if (runData && runData.length > 0) {
        setRun(runData[0]);
      }

      // Fetch steps
      const stepsResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_steps?agent_run_id=eq.${runId}&select=*&order=step_index.asc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session?.access_token}`,
          }
        }
      );
      const stepsData = await stepsResponse.json();
      if (Array.isArray(stepsData)) {
        setSteps(stepsData);
      }
    } catch (error) {
      console.error("Failed to fetch details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = async () => {
    if (!run || run.replay_count > 0) return;
    
    setIsReplaying(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/replay-run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ run_id: runId }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast({ title: "Replay complete", description: "New run created from replay" });
      navigate(`/run/${result.replayed_run_id}`);
    } catch (error) {
      toast({
        title: "Replay failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsReplaying(false);
    }
  };

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) newExpanded.delete(index);
    else newExpanded.add(index);
    setExpandedSteps(newExpanded);
  };

  const getStepTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      prompt: "bg-info/20 text-info border-info/30",
      tool_call: "bg-accent/20 text-accent border-accent/30",
      tool_result: "bg-primary/20 text-primary border-primary/30",
      reasoning: "bg-warning/20 text-warning border-warning/30",
      output: "bg-success/20 text-success border-success/30",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-success";
    if (confidence >= 0.6) return "text-warning";
    return "text-error";
  };

  // Calculate metrics
  const totalLatency = steps.reduce((acc, s) => acc + (s.latency_ms || 0), 0);
  const lowConfidenceSteps = steps.filter(s => (s.confidence || 0) < 0.6).length;
  const highLatencySteps = steps.filter(s => (s.latency_ms || 0) > 500).length;
  const canReplay = run?.replay_count === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          Run not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          {canReplay && (
            <Button onClick={handleReplay} disabled={isReplaying} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              {isReplaying ? "Replaying..." : "Replay Run"}
            </Button>
          )}
        </div>

        {/* Run Header */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={run.status === "success" ? "bg-success/20 text-success" : "bg-error/20 text-error"}>
                    {run.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{run.agent_name}</span>
                </div>
                <h1 className="text-xl font-semibold mb-2">{run.input_query || "No query"}</h1>
                <p className="text-sm text-muted-foreground">
                  Started {format(new Date(run.started_at), "MMM d, yyyy HH:mm:ss")}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-mono font-bold ${getConfidenceColor(run.confidence_score || 0)}`}>
                  {((run.confidence_score || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniMetric icon={<Clock className="h-4 w-4" />} label="Total Latency" value={`${totalLatency}ms`} />
          <MiniMetric icon={<Zap className="h-4 w-4" />} label="Tokens Used" value={run.token_usage || 0} />
          <MiniMetric icon={<Target className="h-4 w-4" />} label="Steps" value={steps.length} />
          <MiniMetric 
            icon={<AlertTriangle className="h-4 w-4" />} 
            label="Warnings" 
            value={lowConfidenceSteps + highLatencySteps}
            color={lowConfidenceSteps > 0 ? "text-warning" : undefined}
          />
        </div>

        {/* Timeline */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Execution Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {steps.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No steps recorded</p>
            ) : (
              steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-[18px] top-10 bottom-0 w-px bg-border" />
                  )}
                  <div
                    onClick={() => toggleStep(index)}
                    className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono ${getStepTypeColor(step.step_type)}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getStepTypeColor(step.step_type)}>
                          {step.step_type}
                        </Badge>
                        {step.tool_name && (
                          <span className="text-sm text-muted-foreground font-mono">{step.tool_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{step.latency_ms}ms</span>
                        <span className={getConfidenceColor(step.confidence || 0)}>
                          {((step.confidence || 0) * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                    {expandedSteps.has(index) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  {expandedSteps.has(index) && (
                    <div className="ml-13 pl-8 py-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Input</h4>
                        <pre className="p-3 rounded bg-background text-sm overflow-auto font-mono max-h-64">
                          {JSON.stringify(step.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Output</h4>
                        <pre className="p-3 rounded bg-background text-sm overflow-auto font-mono max-h-64">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const MiniMetric = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
  <Card className="bg-card border-border">
    <CardContent className="p-4 flex items-center gap-3">
      {icon}
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-lg font-semibold ${color || ""}`}>{value}</div>
      </div>
    </CardContent>
  </Card>
);

export default RunDetail;
