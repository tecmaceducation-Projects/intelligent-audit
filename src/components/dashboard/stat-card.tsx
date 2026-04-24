import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  delta?: number; // percent
  deltaSuffix?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "accent" | "warning";
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  primary: "from-primary/15 to-primary/0 text-primary",
  secondary: "from-secondary/15 to-secondary/0 text-secondary",
  accent: "from-accent/15 to-accent/0 text-accent",
  warning: "from-warning/15 to-warning/0 text-warning",
};

export function StatCard({
  label,
  value,
  decimals = 0,
  suffix,
  prefix,
  delta,
  deltaSuffix = "%",
  icon: Icon,
  tone = "primary",
}: Props) {
  const animated = useCountUp(value, 900, decimals);
  const positive = (delta ?? 0) >= 0;

  return (
    <Card className="group relative overflow-hidden border-border/60 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", toneClasses[tone])} />
      <CardContent className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-background/60 backdrop-blur", toneClasses[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {prefix}
            {animated.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            {suffix}
          </span>
        </div>
        {typeof delta === "number" && (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
                positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta)}
              {deltaSuffix}
            </span>
            <span className="text-muted-foreground">vs. last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
