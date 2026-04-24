import { ArrowRight, Loader2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(String(form.get("email")), String(form.get("password")));
        toast.success("Welcome back");
      } else {
        await signUp(String(form.get("name")), String(form.get("email")), String(form.get("password")));
        toast.success("Account created");
      }
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            AI auditing for the modern claims team.
          </h1>
          <p className="max-w-md text-base text-primary-foreground/80">
            Score every claim in seconds. Catch fraud before it settles. Give your auditors the explainable
            signals they need to act with confidence.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: ShieldCheck, text: "Explainable risk scoring on every claim" },
              { icon: Sparkles, text: "Real-time fraud signals across categories" },
              { icon: TrendingUp, text: "Portfolio insights and pattern detection" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} AuditIQ. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-sm space-y-6 animate-fade-in">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">
                {mode === "signin" ? "Sign in to AuditIQ" : "Create your account"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Continue to your audit workspace."
                  : "Start auditing claims with AI in minutes."}
              </p>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <TabsContent value="signup" className="m-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" name="name" placeholder="Jane Auditor" required={mode === "signup"} />
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={busy} className="w-full bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-95">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
                  {!busy && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            </Tabs>

            <p className="text-center text-xs text-muted-foreground">
              Demo workspace — no email is sent. Your session is stored locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
