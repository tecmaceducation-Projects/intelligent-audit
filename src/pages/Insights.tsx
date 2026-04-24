import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Insights() {
  const { data, isLoading } = useQuery({ queryKey: ["insights"], queryFn: api.getInsights });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const lastTrend = data.fraud_trend[data.fraud_trend.length - 1].rate;
  const prevTrend = data.fraud_trend[data.fraud_trend.length - 2].rate;
  const trendDelta = lastTrend - prevTrend;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Portfolio insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trends, distributions, and patterns across your audited claims.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("PDF exported (UI demo)")}>
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("CSV exported (UI demo)")}>
            <FileSpreadsheet className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Current fraud rate"
          value={`${lastTrend.toFixed(1)}%`}
          delta={trendDelta}
          deltaSuffix="pp"
        />
        <KpiCard label="Cases this month" value={String(data.fraud_trend[data.fraud_trend.length - 1].cases)} delta={6} />
        <KpiCard label="Estimated savings" value="$284K" delta={9.2} good />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend area chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fraud trend (last 6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.fraud_trend}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#trendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top fraud patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.top_patterns.map((p) => (
              <div key={p.pattern}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{p.pattern}</span>
                  <span className="text-muted-foreground tabular-nums">{p.share}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${p.share * 2.5}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Risk distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">High-risk claims distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.risk_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.risk_distribution.map((_, i) => {
                      const colors = [
                        "hsl(var(--success))",
                        "hsl(var(--success))",
                        "hsl(var(--warning))",
                        "hsl(var(--destructive))",
                        "hsl(var(--destructive))",
                      ];
                      return <Cell key={i} fill={colors[i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hospitals leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hospital flagged rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.hospitals.slice(0, 6).map((h) => {
              const rate = h.claims === 0 ? 0 : Math.round((h.flagged / h.claims) * 100);
              return (
                <div key={h.name} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.claims} claims</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      rate >= 50 ? "bg-destructive/15 text-destructive" : rate >= 30 ? "bg-warning/15 text-warning" : "bg-success/15 text-success",
                    )}
                  >
                    {rate}%
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => toast.success("Full report exported (UI demo)")}>
          <Download className="h-4 w-4" /> Download full report
        </Button>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  deltaSuffix = "%",
  good = false,
}: {
  label: string;
  value: string;
  delta: number;
  deltaSuffix?: string;
  good?: boolean;
}) {
  // For "good=true" KPIs (savings), positive delta is good. For others, negative is good.
  const positive = delta >= 0;
  const isGood = good ? positive : !positive;
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isGood ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(delta).toFixed(1)}
          {deltaSuffix}
        </span>
      </CardContent>
    </Card>
  );
}
