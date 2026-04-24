import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import type { ClaimDecision } from "@/lib/api";
import { cn } from "@/lib/utils";

const map: Record<
  ClaimDecision,
  { label: string; classes: string; Icon: typeof CheckCircle2 }
> = {
  approve: {
    label: "Approve",
    classes: "bg-success/10 text-success border-success/20",
    Icon: CheckCircle2,
  },
  reject: {
    label: "Reject",
    classes: "bg-destructive/10 text-destructive border-destructive/20",
    Icon: XCircle,
  },
  investigate: {
    label: "Investigate",
    classes: "bg-warning/10 text-warning border-warning/20",
    Icon: ShieldAlert,
  },
};

export function DecisionBadge({
  decision,
  size = "sm",
  className,
}: {
  decision: ClaimDecision;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { label, classes, Icon } = map[decision];
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-sm px-4 py-1.5 gap-2 font-semibold",
  };
  const iconSizes = { sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-4 w-4" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        classes,
        sizes[size],
        className,
      )}
    >
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  );
}

export function riskTier(score: number) {
  if (score >= 75) return { label: "High risk", tone: "destructive" as const };
  if (score >= 45) return { label: "Medium risk", tone: "warning" as const };
  return { label: "Low risk", tone: "success" as const };
}
