import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Activity, Play, Clock, Zap, Target, AlertTriangle, Plus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, session } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRuns();
    }
  }, [user]);

  const fetchRuns = async () => {
    if (!session?.access_token) return;
    
    setIsLoading(true);
    try {
      // Fetch runs for authenticated user
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_runs?user_id=eq.${user?.id}&select=*&order=started_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRuns(data);
        
        // Calculate metrics
        const totalRuns = data.length;
        const successRuns = data.filter((r: AgentRun) => r.status === 'success').length;
        const failedRuns = data.filter((r: AgentRun) => r.status === 'failed' || r.status === 'timeout').length;
        const avgConfidence = totalRuns > 0 
          ? data.reduce((acc: number, r: AgentRun) => acc + (r.confidence_score || 0), 0) / totalRuns 
          : 0;
        const avgTokens = totalRuns > 0
          ? data.reduce((acc: number, r: AgentRun) => acc + (r.token_usage || 0), 0) / totalRuns
          : 0;

        setMetrics({
          total_runs: totalRuns,
          success_count: successRuns,
          failure_count: failedRuns,
          failure_rate: totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0,
          avg_confidence: avgConfidence,
          avg_token_usage: avgTokens,
        });
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
    
    if (!session?.access_token) {
      toast({ title: "Not authenticated", variant: "destructive" });
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
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ query, user_id: user?.id }),
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
      <Navbar />

      <main className="container py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your agent executions</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={<Play className="h-4 w-4" />} label="Total Runs" value={metrics?.total_runs || 0} />
          <MetricCard icon={<Target className="h-4 w-4" />} label="Avg Confidence" value={`${((metrics?.avg_confidence || 0) * 100).toFixed(0)}%`} />
          <MetricCard 
            icon={<AlertTriangle className="h-4 w-4" />} 
            label="Failure Rate" 
            value={`${(metrics?.failure_rate || 0).toFixed(0)}%`} 
            color={metrics?.failure_rate && metrics.failure_rate > 20 ? "text-error" : undefined} 
          />
          <MetricCard icon={<Zap className="h-4 w-4" />} label="Avg Tokens" value={Math.round(metrics?.avg_token_usage || 0)} />
        </div>

        {/* Trigger Run */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Trigger Agent Run
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research query..."
              className="flex-1 bg-secondary"
              onKeyDown={(e) => e.key === "Enter" && triggerRun()}
            />
            <Button onClick={triggerRun} disabled={isRunning}>
              {isRunning ? "Running..." : "Run Agent"}
            </Button>
          </CardContent>
        </Card>

        {/* Runs Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Agent Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : runs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No runs yet</h3>
                <p className="text-muted-foreground mb-4">Trigger your first agent run above to get started.</p>
              </div>
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
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color || "text-foreground"}`}>{value}</div>
    </CardContent>
  </Card>
);

export default Dashboard;
