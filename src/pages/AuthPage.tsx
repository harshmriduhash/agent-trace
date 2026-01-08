import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { motion } from "framer-motion";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ email: "", password: "", fullName: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const validateField = (field: string, value: string, schema: z.ZodString) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: "" }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "forgot") {
      if (!validateField("email", formData.email, emailSchema)) return;
      setIsLoading(true);
      const { error } = await resetPassword(formData.email);
      setIsLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a password reset link." });
        setMode("signin");
      }
      return;
    }

    const emailValid = validateField("email", formData.email, emailSchema);
    const passwordValid = validateField("password", formData.password, mode === "signup" ? passwordSchema : z.string().min(1, "Required"));
    
    if (mode === "signup" && !formData.fullName.trim()) {
      setErrors(prev => ({ ...prev, fullName: "Name is required" }));
      return;
    }
    
    if (!emailValid || !passwordValid) return;

    setIsLoading(true);
    
    if (mode === "signin") {
      const { error } = await signIn(formData.email, formData.password);
      setIsLoading(false);
      if (error) {
        toast({ title: "Sign in failed", description: "Invalid email or password.", variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      setIsLoading(false);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Welcome to AgentTrace." });
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-lg">A</span>
            </div>
            <span className="text-lg font-semibold">AgentTrace</span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset password"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === "signin" && "Sign in to continue to your dashboard"}
            {mode === "signup" && "Start your 14-day free trial"}
            {mode === "forgot" && "We'll send you a reset link"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="h-11 bg-secondary border-border/50"
                />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                className="h-11 bg-secondary border-border/50"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-sm text-muted-foreground hover:text-foreground">
                      Forgot?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="h-11 bg-secondary border-border/50"
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
            )}

            <Button type="submit" className="w-full h-11 rounded-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" && "Sign in"}
              {mode === "signup" && "Create account"}
              {mode === "forgot" && "Send reset link"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === "signin" && (
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-foreground hover:underline font-medium">Sign up</button>
              </p>
            )}
            {mode === "signup" && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-foreground hover:underline font-medium">Sign in</button>
              </p>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("signin")} className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-secondary/30 border-l border-border/50 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="text-6xl font-bold text-gradient mb-6">Debug AI with confidence</div>
          <p className="text-muted-foreground text-lg">Step-level tracing for every agent execution. Never guess why your AI failed again.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
