export type RiskBand = "LOW" | "MEDIUM" | "HIGH";

export interface RiskSignalDetail {
  id: string;
  name: string;
  weight: number; // e.g. 30, 25, 20, 10, 10, 5
  rawValue: number; // Raw metric (percentage, ratio, count)
  displayValue: string; // e.g. "3.4%", "14 orders", "2.8x"
  normalizedScore: number; // 0 to 1
  contribution: number; // normalizedScore * weight (0 to weight)
  thresholds: {
    safe: number;
    warning: number;
    critical: number;
  };
  status: "SAFE" | "ELEVATED" | "CRITICAL";
  affectedCount: number;
  description: string;
}

export interface RiskSignalsBreakdown {
  disputeRate: RiskSignalDetail;
  missingTracking: RiskSignalDetail;
  volumeSpike: RiskSignalDetail;
  addressMismatch: RiskSignalDetail;
  refundRate: RiskSignalDetail;
  disputeDeadlines: RiskSignalDetail;
}

export interface CashFlowMetrics {
  clearedBalance: number; // available now
  atRiskAmount: number; // estimated at risk (0% low, 10% medium, 30% high of last 14d sales)
  trailing14dSales: number;
  expectedReleaseDays: number; // 0 for low, 21 for medium, 60 for high
  expectedReleaseRange: string; // e.g. "Immediate (No Holds)", "14-21 Days Rolling", "60-180 Days (Account Limitation)"
}

export interface RiskEvaluationResult {
  score: number; // 0 to 100
  band: RiskBand;
  signals: RiskSignalsBreakdown;
  cashFlow: CashFlowMetrics;
  topFactors: Array<{
    signalKey: keyof RiskSignalsBreakdown;
    name: string;
    contribution: number;
    impactDescription: string;
    affectedOrdersCount: number;
  }>;
  evaluatedAt: string;
}
