import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
        <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight">
            Audit<span className="gradient-text">IQ</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Claim intelligence
          </span>
        </div>
      )}
    </div>
  );
}
