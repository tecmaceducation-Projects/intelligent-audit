import {
  addGeneratedClaim,
  getClaimSync,
  getDashboardStatsSync,
  getInsightsSync,
  listClaimsSync,
} from "./mock/data";
import type { Claim, ClaimDecision, DashboardStats, InsightsData } from "./mock/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type ClaimsFilter = {
  search?: string;
  status?: ClaimDecision | "all";
  riskMin?: number;
  riskMax?: number;
};

export const api = {
  async listClaims(filter: ClaimsFilter = {}): Promise<Claim[]> {
    await delay(250);
    let claims = listClaimsSync();
    if (filter.status && filter.status !== "all") {
      claims = claims.filter((c) => c.decision === filter.status);
    }
    if (typeof filter.riskMin === "number") claims = claims.filter((c) => c.risk_score >= filter.riskMin!);
    if (typeof filter.riskMax === "number") claims = claims.filter((c) => c.risk_score <= filter.riskMax!);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      claims = claims.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.claim_data.patient_name.toLowerCase().includes(q) ||
          c.claim_data.hospital.toLowerCase().includes(q),
      );
    }
    return claims;
  },

  async getClaim(id: string): Promise<Claim | undefined> {
    await delay(200);
    return getClaimSync(id);
  },

  async uploadClaim(): Promise<{ id: string }> {
    await delay(500);
    const c = addGeneratedClaim();
    return { id: c.id };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await delay(280);
    return getDashboardStatsSync();
  },

  async getInsights(): Promise<InsightsData> {
    await delay(320);
    return getInsightsSync();
  },
};

export type { Claim, ClaimDecision, DashboardStats, InsightsData } from "./mock/types";
