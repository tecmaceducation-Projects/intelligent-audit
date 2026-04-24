import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
};

export function RiskGauge({ score, size = 200, strokeWidth = 14, className, showLabel = true }: Props) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (animated / 100) * circumference;

  const color =
    score >= 75 ? "hsl(var(--destructive))" : score >= 45 ? "hsl(var(--warning))" : "hsl(var(--success))";
  const tier = score >= 75 ? "High" : score >= 45 ? "Medium" : "Low";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk score</span>
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {Math.round(animated)}
        </span>
        {showLabel && <span className="mt-0.5 text-xs font-medium text-muted-foreground">{tier} risk</span>}
      </div>
    </div>
  );
}
