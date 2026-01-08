import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Play, Clock, Zap, Target, AlertTriangle, Plus, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
    if (user) fetchRuns();
  }, [user]);

  const fetchRuns = async () => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
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
        const totalRuns = data.length;
        const successRuns = data.filter((r: AgentRun) => r.status === 'success').length;
        const failedRuns = data.filter((r: AgentRun) => r.status === 'failed' || r.status === 'timeout').length;
        setMetrics({
          total_runs: totalRuns,
          success_count: successRuns,
          failure_count: failedRuns,
          failure_rate: totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0,
          avg_confidence: totalRuns > 0 ? data.reduce((acc: number, r: AgentRun) => acc + (r.confidence_score || 0), 0) / totalRuns : 0,
          avg_token_usage: totalRuns > 0 ? data.reduce((acc: number, r: AgentRun) => acc + (r.token_usage || 0), 0) / totalRuns : 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch runs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRun = async () => {
    if (!query.trim() || !session?.access_token) return;
    setIsRunning(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ query, user_id: user?.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast({ title: "Agent run completed", description: `Status: ${data.status}` });
      setQuery("");
      fetchRuns();
    } catch (error) {
      toast({ title: "Run failed", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-success",
      failed: "bg-destructive",
      timeout: "bg-warning",
      running: "bg-info",
      pending: "bg-muted-foreground",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your agent executions</p>
        </motion.div>

        {/* Metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard icon={<Play className="h-4 w-4" />} label="Total Runs" value={metrics?.total_runs || 0} />
          <MetricCard icon={<Target className="h-4 w-4" />} label="Avg Confidence" value={`${((metrics?.avg_confidence || 0) * 100).toFixed(0)}%`} />
          <MetricCard icon={<AlertTriangle className="h-4 w-4" />} label="Failure Rate" value={`${(metrics?.failure_rate || 0).toFixed(0)}%`} alert={metrics?.failure_rate && metrics.failure_rate > 20} />
          <MetricCard icon={<Zap className="h-4 w-4" />} label="Avg Tokens" value={Math.round(metrics?.avg_token_usage || 0)} />
        </motion.div>

        {/* Trigger Run */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-xl bg-card border border-border/50">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Trigger Agent Run</h2>
          <div className="flex gap-3">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter research query..." className="flex-1 h-11 bg-secondary border-border/50" onKeyDown={(e) => e.key === "Enter" && triggerRun()} />
            <Button onClick={triggerRun} disabled={isRunning} className="h-11 px-6 rounded-full">{isRunning ? "Running..." : "Run Agent"}</Button>
          </div>
        </motion.div>

        {/* Runs List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl bg-card border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-semibold">Agent Runs</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-16">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No runs yet</h3>
              <p className="text-muted-foreground">Trigger your first agent run above to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {runs.map((run) => (
                <div key={run.id} onClick={() => navigate(`/run/${run.id}`)} className="flex items-center justify-between p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(run.status)}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{run.input_query || "No query"}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(run.started_at), "MMM d, HH:mm")}</span>
                        <span>{run.token_usage} tokens</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-mono">{((run.confidence_score || 0) * 100).toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, label, value, alert }: { icon: React.ReactNode; label: string; value: string | number; alert?: boolean }) => (
  <div className="p-5 rounded-xl bg-card border border-border/50">
    <div className="flex items-center gap-2 text-muted-foreground mb-2">{icon}<span className="text-sm">{label}</span></div>
    <div className={`text-2xl font-semibold ${alert ? "text-destructive" : ""}`}>{value}</div>
  </div>
);

export default Dashboard;
