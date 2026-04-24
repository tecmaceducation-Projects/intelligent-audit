import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/brand/logo";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = [
  "Extracting claim data",
  "Validating policy coverage",
  "Cross-referencing prior claims",
  "Detecting fraud signals",
  "Generating AI insights",
];

export default function Processing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [claimId, setClaimId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { id } = await api.uploadClaim();
      if (cancelled) return;
      setClaimId(id);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (step >= STEPS.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 700 + Math.random() * 400);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step >= STEPS.length && claimId) {
      const t = setTimeout(() => navigate(`/claims/${claimId}`, { replace: true }), 500);
      return () => clearTimeout(t);
    }
  }, [step, claimId, navigate]);

  const progress = Math.min(step / STEPS.length, 1);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-xl space-y-10 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Animated AI orb */}
        <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/30" />
          <span
            className="absolute inset-0 animate-pulse-ring rounded-full bg-accent/30"
            style={{ animationDelay: "0.6s" }}
          />
          <span
            className="absolute inset-0 animate-pulse-ring rounded-full bg-secondary/30"
            style={{ animationDelay: "1.2s" }}
          />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">AI is auditing your claim</h1>
          <p className="text-sm text-muted-foreground">
            Hang tight — we're analyzing the document, cross-referencing your policy, and scoring fraud risk.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mx-auto h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-brand transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Steps */}
        <ol className="mx-auto max-w-sm space-y-3 text-left">
          {STEPS.map((label, i) => {
            const isDone = i < step;
            const isActive = i === step;
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card/60 px-4 py-3 text-sm transition-all",
                  isActive && "border-primary/40 bg-primary/5 shadow-soft",
                  isDone && "border-success/30 bg-success/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
                    isDone && "bg-success text-success-foreground",
                    isActive && "bg-primary text-primary-foreground",
                    !isActive && !isDone && "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-3 w-3" /> : isActive ? <Loader2 className="h-3 w-3 animate-spin" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    isDone && "text-foreground",
                    isActive && "text-foreground",
                    !isActive && !isDone && "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
