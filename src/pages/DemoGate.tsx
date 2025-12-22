import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Activity, Zap, Eye, RotateCcw } from "lucide-react";

const DemoGate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    evaluation_notes: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/demo-access`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create demo session");
      }

      localStorage.setItem("demo_session_id", data.demo_session_id);
      localStorage.setItem("demo_expires_at", data.expires_at);
      
      toast({
        title: "Access Granted",
        description: "Welcome to the Agent Observability Platform demo.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access demo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-secondary to-background border-r border-border">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">AgentTrace</span>
          </div>
          <p className="text-muted-foreground">Observability for AI Agents</p>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-foreground leading-tight">
            Debug AI agents<br />
            <span className="text-gradient-primary">like a pro</span>
          </h1>
          
          <div className="space-y-4">
            <FeatureItem icon={<Eye className="h-5 w-5" />} title="Step-by-step traces" description="See every decision your agent makes" />
            <FeatureItem icon={<Zap className="h-5 w-5" />} title="Real-time metrics" description="Latency, confidence, token usage" />
            <FeatureItem icon={<RotateCcw className="h-5 w-5" />} title="Execution replay" description="Re-run any agent execution" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Built for engineering teams deploying production AI agents.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">AgentTrace</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Request Demo Access</h2>
            <p className="mt-2 text-muted-foreground">
              Get 48 hours of full platform access. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                  <SelectItem value="CTO">CTO</SelectItem>
                  <SelectItem value="Founder">Founder</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">What are you evaluating? (optional)</Label>
              <Textarea
                id="notes"
                value={formData.evaluation_notes}
                onChange={(e) => setFormData({ ...formData, evaluation_notes: e.target.value })}
                placeholder="E.g., debugging our customer support agent..."
                className="bg-secondary border-border resize-none"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || !formData.role}
            >
              {isLoading ? "Creating session..." : "Get Demo Access"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Demo includes 5 agent runs and full trace inspection.
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
    <div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default DemoGate;
