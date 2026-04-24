import { pick, rand, randInt, range } from "./random";
import type {
  Claim,
  ClaimDecision,
  DashboardStats,
  FraudFlag,
  InsightsData,
  PolicyLineItem,
} from "./types";

const HOSPITALS = [
  "St. Mary Medical Center",
  "Apollo General Hospital",
  "Northbridge Health",
  "Cedar Valley Clinic",
  "Riverside Memorial",
  "Lakeside Specialty Hospital",
  "Greenfield Care",
  "Summit Orthopedic",
];

const FIRST_NAMES = ["Aarav", "Maya", "Liam", "Noor", "Sofia", "Ethan", "Priya", "Lucas", "Amara", "Kenji", "Elena", "Marcus"];
const LAST_NAMES = ["Patel", "Chen", "Garcia", "Khan", "Müller", "Okafor", "Singh", "Rossi", "Nguyen", "Anderson"];

const CLAIM_TYPES = ["Inpatient", "Outpatient", "Emergency", "Surgery", "Diagnostic", "Pharmacy"];
const DIAGNOSES = [
  "Acute appendicitis",
  "Type 2 diabetes management",
  "Coronary angiography",
  "Knee arthroscopy",
  "Pneumonia treatment",
  "Fractured radius",
  "Cataract surgery",
  "Hypertension follow-up",
];

const FRAUD_TEMPLATES: Omit<FraudFlag, "id">[] = [
  { type: "duplicate", severity: "high", title: "Duplicate claim detected", detail: "Strong match (87%) with prior claim CLM-2041 submitted 12 days ago." },
  { type: "anomaly", severity: "medium", title: "Billing anomaly", detail: "Procedure cost is 3.2× the regional average for this diagnosis." },
  { type: "mismatch", severity: "medium", title: "Policy mismatch", detail: "Claimed procedure is partially excluded under policy clause 4.2.b." },
  { type: "identity", severity: "high", title: "Identity inconsistency", detail: "Patient DOB on submitted ID does not match policy records." },
  { type: "billing", severity: "low", title: "Itemization gap", detail: "Two line items lack supporting invoices or codes." },
  { type: "anomaly", severity: "high", title: "Unusual provider pattern", detail: "Provider has flagged claims rate 4× the network median." },
];

function decisionFromScore(score: number): ClaimDecision {
  if (score >= 75) return "reject";
  if (score >= 45) return "investigate";
  return "approve";
}

function makePolicy(amount: number): PolicyLineItem[] {
  const items: PolicyLineItem[] = [
    { label: "Room & Board", amount: Math.round(amount * 0.32), covered: true },
    { label: "Surgical Procedure", amount: Math.round(amount * 0.38), covered: true },
    { label: "Diagnostic Imaging", amount: Math.round(amount * 0.12), covered: rand() > 0.3 },
    { label: "Pharmacy", amount: Math.round(amount * 0.1), covered: true },
    { label: "Consumables", amount: Math.round(amount * 0.08), covered: rand() > 0.5, reason: "Capped at policy sub-limit" },
  ];
  return items;
}

function makeFlags(score: number): FraudFlag[] {
  const count = score >= 75 ? randInt(2, 4) : score >= 45 ? randInt(1, 3) : score >= 25 ? randInt(0, 1) : 0;
  const chosen: FraudFlag[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const tpl = FRAUD_TEMPLATES[Math.floor(rand() * FRAUD_TEMPLATES.length)];
    const key = tpl.title;
    if (used.has(key)) continue;
    used.add(key);
    chosen.push({ ...tpl, id: crypto.randomUUID() });
  }
  return chosen;
}

function makeExplanation(score: number, flags: FraudFlag[], type: string): string {
  if (score >= 75) {
    return `This claim presents a high probability of fraud. Multiple high-severity signals were detected, including ${
      flags[0]?.title.toLowerCase() ?? "anomalous billing"
    }. The model recommends rejection pending manual investigation. Comparable ${type.toLowerCase()} claims in the historical dataset with similar signal patterns were confirmed fraudulent in 81% of cases.`;
  }
  if (score >= 45) {
    return `The claim shows partial inconsistencies that warrant a closer look. While the diagnosis and procedure align, ${
      flags[0]?.title.toLowerCase() ?? "billing details"
    } reduce confidence. We recommend routing this claim to a senior auditor for verification before settlement.`;
  }
  return `All key validations passed: policy coverage, diagnosis alignment, and provider history are consistent. No material fraud signals detected. The claim can be safely approved within the standard SLA.`;
}

function makeHighlights(flags: FraudFlag[]): string[] {
  if (flags.length === 0) return ["Policy clauses fully satisfied", "No anomaly in billing", "Provider in good standing"];
  return flags.slice(0, 3).map((f) => f.title);
}

function makeClaim(index: number): Claim {
  const score = randInt(5, 96);
  const decision = decisionFromScore(score);
  const amount = randInt(1200, 48000);
  const type = pick(CLAIM_TYPES);
  const flags = makeFlags(score);
  const created = new Date(Date.now() - randInt(0, 60) * 86400000 - randInt(0, 23) * 3600000);
  const id = `CLM-${String(20000 + index).padStart(5, "0")}`;
  const patientFirst = pick(FIRST_NAMES);
  const patientLast = pick(LAST_NAMES);
  return {
    id,
    created_at: created.toISOString(),
    risk_score: score,
    decision,
    confidence: 0.6 + rand() * 0.39,
    fraud_flags: flags,
    explanation: makeExplanation(score, flags, type),
    highlights: makeHighlights(flags),
    policy_validation: makePolicy(amount),
    claim_data: {
      patient_name: `${patientFirst} ${patientLast}`,
      patient_id: `PT-${randInt(10000, 99999)}`,
      hospital: pick(HOSPITALS),
      policy_number: `POL-${randInt(100000, 999999)}`,
      claim_type: type,
      amount,
      currency: "USD",
      date: created.toISOString(),
      diagnosis: pick(DIAGNOSES),
    },
  };
}

const CLAIMS: Claim[] = range(64)
  .map((i) => makeClaim(i))
  .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

export function listClaimsSync(): Claim[] {
  return CLAIMS;
}

export function getClaimSync(id: string): Claim | undefined {
  return CLAIMS.find((c) => c.id === id);
}

export function addGeneratedClaim(): Claim {
  const c = makeClaim(CLAIMS.length);
  // Stamp it as just-created
  c.created_at = new Date().toISOString();
  c.claim_data.date = c.created_at;
  CLAIMS.unshift(c);
  return c;
}

export function getDashboardStatsSync(): DashboardStats {
  const total = CLAIMS.length;
  const flagged = CLAIMS.filter((c) => c.decision !== "approve").length;
  const pending = CLAIMS.filter((c) => c.decision === "investigate").length;
  const avgRisk = Math.round(CLAIMS.reduce((s, c) => s + c.risk_score, 0) / total);

  const days = 30;
  const now = new Date();
  const series = range(days).map((i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const dayClaims = CLAIMS.filter((c) => c.created_at.slice(0, 10) === key);
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      processed: dayClaims.length || randInt(2, 9),
      flagged: dayClaims.filter((c) => c.decision !== "approve").length || randInt(0, 3),
    };
  });

  const decisionSplit = (["approve", "reject", "investigate"] as ClaimDecision[]).map((d) => ({
    name: d === "approve" ? "Approved" : d === "reject" ? "Rejected" : "Investigate",
    value: CLAIMS.filter((c) => c.decision === d).length,
  }));

  const categoryCounts = new Map<string, number>();
  for (const c of CLAIMS) for (const f of c.fraud_flags) categoryCounts.set(f.type, (categoryCounts.get(f.type) ?? 0) + 1);
  const fraudCategories = ["duplicate", "anomaly", "mismatch", "identity", "billing"].map((k) => ({
    name: k[0].toUpperCase() + k.slice(1),
    value: categoryCounts.get(k) ?? 0,
  }));

  return {
    total_claims: total,
    fraud_rate: Math.round((flagged / total) * 1000) / 10,
    avg_risk_score: avgRisk,
    pending_investigations: pending,
    total_delta: 12.4,
    fraud_delta: -2.1,
    risk_delta: 3.6,
    pending_delta: 4,
    claims_over_time: series,
    decision_split: decisionSplit,
    fraud_categories: fraudCategories,
    recent_activity: CLAIMS.slice(0, 8).map(({ id, decision, risk_score, created_at, claim_data }) => ({
      id,
      decision,
      risk_score,
      created_at,
      claim_data,
    })),
  };
}

export function getInsightsSync(): InsightsData {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const fraud_trend = months.map((m, i) => ({
    month: m,
    rate: 6 + i * 0.6 + (rand() - 0.5) * 1.4,
    cases: 18 + i * 3 + randInt(-3, 6),
  }));

  const buckets = ["0–20", "21–40", "41–60", "61–80", "81–100"];
  const risk_distribution = buckets.map((b, i) => {
    const lo = i * 20;
    const hi = lo + 20;
    return { bucket: b, count: CLAIMS.filter((c) => c.risk_score >= lo && c.risk_score < (hi === 100 ? 101 : hi)).length };
  });

  const top_patterns = [
    { pattern: "Duplicate submissions", share: 31 },
    { pattern: "Inflated billing", share: 24 },
    { pattern: "Identity mismatch", share: 17 },
    { pattern: "Excluded procedures", share: 15 },
    { pattern: "Provider anomalies", share: 13 },
  ];

  const hospitals = HOSPITALS.map((name) => {
    const ofHosp = CLAIMS.filter((c) => c.claim_data.hospital === name);
    return {
      name,
      claims: ofHosp.length,
      flagged: ofHosp.filter((c) => c.decision !== "approve").length,
    };
  }).sort((a, b) => b.flagged - a.flagged);

  return { fraud_trend, risk_distribution, top_patterns, hospitals };
}
