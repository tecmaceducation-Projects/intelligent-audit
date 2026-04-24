import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DecisionBadge } from "@/components/audit/decision-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type ClaimDecision } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: ClaimDecision | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Approve", value: "approve" },
  { label: "Investigate", value: "investigate" },
  { label: "Reject", value: "reject" },
];

export default function ClaimsHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClaimDecision | "all">("all");
  const [riskRange, setRiskRange] = useState<[number, number]>([0, 100]);

  const { data, isLoading } = useQuery({
    queryKey: ["claims", status, riskRange, search],
    queryFn: () => api.listClaims({ status, riskMin: riskRange[0], riskMax: riskRange[1], search }),
  });

  const total = data?.length ?? 0;
  const counts = useMemo(() => {
    const all = data ?? [];
    return {
      approve: all.filter((c) => c.decision === "approve").length,
      investigate: all.filter((c) => c.decision === "investigate").length,
      reject: all.filter((c) => c.decision === "reject").length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Claims history</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} claim{total === 1 ? "" : "s"} match your filters.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto_minmax(220px,300px)] md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claim ID, patient, hospital…"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  status === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Risk score</span>
              <span className="tabular-nums">
                {riskRange[0]} – {riskRange[1]}
              </span>
            </div>
            <Slider
              value={riskRange}
              onValueChange={(v) => setRiskRange([v[0], v[1]] as [number, number])}
              min={0}
              max={100}
              step={1}
              minStepsBetweenThumbs={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { label: "Approved", value: counts.approve, color: "text-success" },
            { label: "Investigate", value: counts.investigate, color: "text-warning" },
            { label: "Rejected", value: counts.reject, color: "text-destructive" },
          ] as const
        ).map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <span className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[160px]">Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      No claims match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((c) => {
                    const tone =
                      c.risk_score >= 75
                        ? "bg-destructive"
                        : c.risk_score >= 45
                          ? "bg-warning"
                          : "bg-success";
                    return (
                      <TableRow
                        key={c.id}
                        onClick={() => navigate(`/claims/${c.id}`)}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-xs font-medium">{c.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                        <TableCell className="text-sm">{c.claim_data.patient_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.claim_data.hospital}</TableCell>
                        <TableCell className="text-right text-sm font-semibold tabular-nums">
                          {formatCurrency(c.claim_data.amount, c.claim_data.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn("h-full rounded-full", tone)}
                                style={{ width: `${c.risk_score}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums">{c.risk_score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DecisionBadge decision={c.decision} />
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
