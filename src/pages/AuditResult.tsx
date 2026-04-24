import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  FileWarning,
  Hash,
  Lightbulb,
  Sparkles,
  Stethoscope,
  User2,
  X,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DecisionBadge, riskTier } from "@/components/audit/decision-badge";
import { RiskGauge } from "@/components/audit/risk-gauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type ClaimDecision } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const severityColor = {
  high: "border-destructive/30 bg-destructive/5 text-destructive",
  medium: "border-warning/30 bg-warning/5 text-warning",
  low: "border-secondary/30 bg-secondary/5 text-secondary",
};

const decisionLabel: Record<ClaimDecision, string> = {
  approve: "Approve claim",
  reject: "Reject claim",
  investigate: "Send to investigation",
};

export default function AuditResult() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: claim, isLoading } = useQuery({
    queryKey: ["claim", id],
    queryFn: () => api.getClaim(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-20 text-center">
        <FileWarning className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Claim not found</h1>
        <p className="text-sm text-muted-foreground">We couldn't locate that claim. It may have been removed.</p>
        <Button onClick={() => navigate("/claims")}>Back to claims</Button>
      </div>
    );
  }

  const tier = riskTier(claim.risk_score);
  const c = claim.claim_data;

  const onAction = (decision: ClaimDecision) => {
    const map = {
      approve: "Claim marked for approval",
      reject: "Claim marked for rejection",
      investigate: "Claim routed to investigation",
    };
    toast.success(map[decision]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.success("Report exported (UI demo)")}>
          <Download className="h-4 w-4" /> Export report
        </Button>
      </div>

      {/* Hero result card */}
      <Card className="relative overflow-hidden border-border/60 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-glow" />
        <CardContent className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr] md:p-8">
          <div className="flex justify-center">
            <RiskGauge score={claim.risk_score} size={220} />
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs">{claim.id}</span>
                <DecisionBadge decision={claim.decision} size="lg" />
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    tier.tone === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive",
                    tier.tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
                    tier.tone === "success" && "border-success/30 bg-success/10 text-success",
                  )}
                >
                  {tier.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{c.patient_name}</h1>
              <p className="text-sm text-muted-foreground">
                {c.diagnosis} • {c.claim_type} claim at {c.hospital}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                <span className="font-semibold">{Math.round(claim.confidence * 100)}%</span>
                <span className="text-muted-foreground">model confidence</span>
              </div>
              <div className="text-muted-foreground">
                Claim amount: <span className="font-semibold text-foreground">{formatCurrency(c.amount, c.currency)}</span>
              </div>
              <div className="text-muted-foreground">
                Submitted: <span className="font-medium text-foreground">{formatDate(c.date)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => onAction("approve")} className="bg-success text-success-foreground hover:bg-success/90">
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => onAction("investigate")} variant="outline">
                <ShieldAlert className="h-4 w-4 text-warning" /> Investigate
              </Button>
              <Button onClick={() => onAction("reject")} variant="outline" className="text-destructive hover:text-destructive">
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="policy">Policy validation</TabsTrigger>
            <TabsTrigger value="fraud">
              Fraud insights
              {claim.fraud_flags.length > 0 && (
                <span className="ml-1.5 rounded-full bg-destructive/15 px-1.5 text-[10px] font-semibold text-destructive">
                  {claim.fraud_flags.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="explain">AI explanation</TabsTrigger>
            <TabsTrigger value="recommend">Recommendation</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Claim summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field icon={User2} label="Patient" value={`${c.patient_name} (${c.patient_id})`} />
                <Field icon={Building2} label="Hospital" value={c.hospital} />
                <Field icon={Hash} label="Policy number" value={c.policy_number} />
                <Field icon={Stethoscope} label="Diagnosis" value={c.diagnosis} />
                <Field icon={CalendarDays} label="Claim date" value={formatDate(c.date)} />
                <Field icon={Sparkles} label="Claim type" value={c.claim_type} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policy">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Policy validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {claim.policy_validation.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border bg-card/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full",
                          item.covered ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {item.covered ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.reason && <p className="text-xs text-muted-foreground">{item.reason}</p>}
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.amount, c.currency)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">Covered total</span>
                  <span className="font-bold tabular-nums">
                    {formatCurrency(
                      claim.policy_validation.filter((i) => i.covered).reduce((s, i) => s + i.amount, 0),
                      c.currency,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fraud detection insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {claim.fraud_flags.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span>No material fraud signals detected on this claim.</span>
                  </div>
                ) : (
                  claim.fraud_flags.map((flag) => (
                    <div
                      key={flag.id}
                      className={cn("rounded-xl border p-4", severityColor[flag.severity])}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">{flag.title}</p>
                            <p className="mt-1 text-xs opacity-90">{flag.detail}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                          {flag.severity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explain">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  AI explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground/90">{claim.explanation}</p>
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Key signals
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {claim.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommend">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-glow opacity-60" />
              <CardContent className="relative space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <DecisionBadge decision={claim.decision} size="lg" />
                  <span className="text-sm text-muted-foreground">Recommended action</span>
                </div>
                <h3 className="text-xl font-bold">{decisionLabel[claim.decision]}</h3>
                <p className="text-sm text-muted-foreground">{claim.explanation}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={() => onAction(claim.decision)} className="bg-gradient-brand text-primary-foreground hover:opacity-95">
                    Apply recommendation
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/claims")}>
                    Review later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky right rail */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Risk score" value={`${claim.risk_score} / 100`} />
              <Row label="Decision" value={<DecisionBadge decision={claim.decision} />} />
              <Row label="Confidence" value={`${Math.round(claim.confidence * 100)}%`} />
              <Row label="Fraud flags" value={String(claim.fraud_flags.length)} />
              <Row label="Amount" value={formatCurrency(c.amount, c.currency)} />
              <Row label="Submitted" value={formatDate(c.date)} />
            </CardContent>
          </Card>
          <Card className="bg-gradient-brand text-primary-foreground">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">AI tip</p>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Similar claim patterns from this provider have a {Math.round(claim.risk_score * 0.6)}%
                investigation rate. Consider batch reviewing recent submissions.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof User2; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card/40 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
