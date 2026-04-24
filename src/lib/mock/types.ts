export type ClaimDecision = "approve" | "reject" | "investigate";

export type FraudFlag = {
  id: string;
  type: "duplicate" | "anomaly" | "mismatch" | "identity" | "billing";
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
};

export type PolicyLineItem = {
  label: string;
  amount: number;
  covered: boolean;
  reason?: string;
};

export type ClaimData = {
  patient_name: string;
  patient_id: string;
  hospital: string;
  policy_number: string;
  claim_type: string;
  amount: number;
  currency: string;
  date: string; // ISO
  diagnosis: string;
};

export type Claim = {
  id: string;
  created_at: string; // ISO
  risk_score: number; // 0-100
  decision: ClaimDecision;
  confidence: number; // 0-1
  fraud_flags: FraudFlag[];
  explanation: string;
  highlights: string[];
  policy_validation: PolicyLineItem[];
  claim_data: ClaimData;
};

export type DashboardStats = {
  total_claims: number;
  fraud_rate: number; // percent
  avg_risk_score: number;
  pending_investigations: number;
  total_delta: number;
  fraud_delta: number;
  risk_delta: number;
  pending_delta: number;
  claims_over_time: { date: string; processed: number; flagged: number }[];
  decision_split: { name: string; value: number }[];
  fraud_categories: { name: string; value: number }[];
  recent_activity: Pick<Claim, "id" | "decision" | "risk_score" | "created_at" | "claim_data">[];
};

export type InsightsData = {
  fraud_trend: { month: string; rate: number; cases: number }[];
  risk_distribution: { bucket: string; count: number }[];
  top_patterns: { pattern: string; share: number }[];
  hospitals: { name: string; claims: number; flagged: number }[];
};
