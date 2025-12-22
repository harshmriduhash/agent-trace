import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Activity, Play, Clock, Zap, Target, AlertTriangle, LogOut } from "lucide-react";
import { format } from "date-fns";

interface AgentRun {
  id: string;
  agent_name: string;
  status: string;
  confidence_score: number;
  started_at: string;
  completed_at: string;
  token_usage: number;
  input_query: string;
  error_message: string | null;
}

interface Metrics {
  total_runs: number;
  success_count: number;
  failure_count: number;
  failure_rate: number;
  avg_confidence: number;
  avg_token_usage: number;
}

const Dashboard = () => {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sessionId = localStorage.getItem("demo_session_id");

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }
    fetchRuns();
  }, [sessionId]);

  const fetchRuns = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-runs`,
        {
          headers: { "X-Demo-Session": sessionId! },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setRuns(data.runs || []);
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error("Failed to fetch runs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRun = async () => {
    if (!query.trim()) {
      toast({ title: "Enter a query", variant: "destructive" });
      return;
    }
    setIsRunning(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Demo-Session": sessionId!,
          },
          body: JSON.stringify({ query }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast({ title: "Agent run completed", description: `Status: ${data.status}` });
      setQuery("");
      fetchRuns();
    } catch (error) {
      toast({
        title: "Run failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("demo_session_id");
    localStorage.removeItem("demo_expires_at");
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: "bg-success/20 text-success border-success/30",
      failed: "bg-error/20 text-error border-error/30",
      timeout: "bg-warning/20 text-warning border-warning/30",
      running: "bg-info/20 text-info border-info/30",
      pending: "bg-muted text-muted-foreground",
    };
    return <Badge className={`${variants[status] || variants.pending} border`}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AgentTrace</span>
            <Badge variant="outline" className="ml-2">Demo</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Exit Demo
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={<Play />} label="Total Runs" value={metrics?.total_runs || 0} />
          <MetricCard icon={<Target />} label="Avg Confidence" value={`${((metrics?.avg_confidence || 0) * 100).toFixed(0)}%`} />
          <MetricCard icon={<AlertTriangle />} label="Failure Rate" value={`${(metrics?.failure_rate || 0).toFixed(0)}%`} color={metrics?.failure_rate && metrics.failure_rate > 20 ? "text-error" : undefined} />
          <MetricCard icon={<Zap />} label="Avg Tokens" value={Math.round(metrics?.avg_token_usage || 0)} />
        </div>

        {/* Trigger Run */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Trigger Agent Run</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research query..."
              className="flex-1 bg-secondary"
              onKeyDown={(e) => e.key === "Enter" && triggerRun()}
            />
            <Button onClick={triggerRun} disabled={isRunning} className="bg-primary text-primary-foreground">
              {isRunning ? "Running..." : "Run Agent"}
            </Button>
          </CardContent>
        </Card>

        {/* Runs Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Agent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : runs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No runs yet. Trigger your first agent run above.</p>
            ) : (
              <div className="space-y-2">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => navigate(`/run/${run.id}`)}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(run.status)}
                        <span className="font-medium truncate">{run.input_query || "No query"}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(run.started_at), "MMM d, HH:mm")}
                        </span>
                        <span>{run.token_usage} tokens</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono">
                        {((run.confidence_score || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
  <Card className="bg-card border-border">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <span className="h-4 w-4">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color || "text-foreground"}`}>{value}</div>
    </CardContent>
  </Card>
);

export default Dashboard;
