import {
  RiskBand,
  RiskEvaluationResult,
  RiskSignalsBreakdown,
  CashFlowMetrics,
} from "./types";

export interface OrderInput {
  id: string;
  paypalOrderId: string;
  amount: number;
  createdAt: Date | string;
  shippedAt?: Date | string | null;
  trackingNumber?: string | null;
  trackingStatus: string;
  isAddressMismatch: boolean;
  sellerProtectionStatus: string;
  refundedAmount: number;
}

export interface DisputeInput {
  id: string;
  paypalDisputeId: string;
  orderId: string;
  amount: number;
  status: string; // OPEN, UNDER_REVIEW, RESOLVED, WAITING_FOR_SELLER
  openedAt: Date | string;
  responseDueAt: Date | string;
  reason: string;
}

export type UnderwritingProfile = "STANDARD_RETAIL" | "DROPSHIPPING" | "DIGITAL_SAAS";

export interface WeightProfileConfig {
  id: UnderwritingProfile;
  name: string;
  tagline: string;
  description: string;
  weights: {
    disputeRate: number;
    missingTracking: number;
    volumeSpike: number;
    addressMismatch: number;
    refundRate: number;
    disputeDeadlines: number;
  };
}

export const UNDERWRITING_PROFILES: Record<UnderwritingProfile, WeightProfileConfig> = {
  STANDARD_RETAIL: {
    id: "STANDARD_RETAIL",
    name: "Standard Retail & Physical E-Commerce",
    tagline: "Default Balanced Physical Goods Model",
    description: "55% weighted on prompt carrier tracking and dispute rates. Matches standard PayPal Seller Protection guidelines.",
    weights: {
      disputeRate: 30,
      missingTracking: 25,
      volumeSpike: 20,
      addressMismatch: 10,
      refundRate: 10,
      disputeDeadlines: 5,
    },
  },
  DROPSHIPPING: {
    id: "DROPSHIPPING",
    name: "High-Velocity Dropshipping",
    tagline: "Supplier Fulfillment Delay Sensitivity",
    description: "Extended international fulfillment lines. Elevated tracking scrutiny (35%) and unconfirmed address scrutiny (15%).",
    weights: {
      disputeRate: 25,
      missingTracking: 35,
      volumeSpike: 15,
      addressMismatch: 15,
      refundRate: 5,
      disputeDeadlines: 5,
    },
  },
  DIGITAL_SAAS: {
    id: "DIGITAL_SAAS",
    name: "Digital Goods, Software & SaaS",
    tagline: "Zero Physical Tracking Model",
    description: "No physical dispatch. Weight reallocated from shipping to dispute defense (45%) and refund velocity (25%).",
    weights: {
      disputeRate: 45,
      missingTracking: 0,
      volumeSpike: 20,
      addressMismatch: 0,
      refundRate: 25,
      disputeDeadlines: 10,
    },
  },
};

export interface EvaluationInput {
  orders: OrderInput[];
  disputes: DisputeInput[];
  referenceDate?: Date;
  currentBalance?: number;
  profile?: UnderwritingProfile;
  customWeights?: {
    disputeRate: number;
    missingTracking: number;
    volumeSpike: number;
    addressMismatch: number;
    refundRate: number;
    disputeDeadlines: number;
  };
}

// Weights as specified in the hackathon build spec
export const RISK_WEIGHTS = {
  disputeRate: 30,
  missingTracking: 25,
  volumeSpike: 20,
  addressMismatch: 10,
  refundRate: 10,
  disputeDeadlines: 5,
} as const;

export function evaluateRisk(input: EvaluationInput): RiskEvaluationResult {
  const activeWeights =
    input.customWeights ||
    (input.profile ? UNDERWRITING_PROFILES[input.profile]?.weights : null) ||
    RISK_WEIGHTS;
  const now = input.referenceDate ? new Date(input.referenceDate) : new Date();

  // Helper date boundaries
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Filter orders by time windows
  const ordersLast30d = input.orders.filter(
    (o) => new Date(o.createdAt) >= thirtyDaysAgo && new Date(o.createdAt) <= now
  );
  const ordersPrev30d = input.orders.filter(
    (o) =>
      new Date(o.createdAt) >= sixtyDaysAgo &&
      new Date(o.createdAt) < thirtyDaysAgo
  );
  const ordersLast7d = input.orders.filter(
    (o) => new Date(o.createdAt) >= sevenDaysAgo && new Date(o.createdAt) <= now
  );
  const ordersLast14d = input.orders.filter(
    (o) =>
      new Date(o.createdAt) >= fourteenDaysAgo && new Date(o.createdAt) <= now
  );

  // Total sales volume in last 14 days
  const trailing14dSales = ordersLast14d.reduce((sum, o) => sum + o.amount, 0);

  // Total sales volume in last 30 days
  const salesLast30d = ordersLast30d.reduce((sum, o) => sum + o.amount, 0);

  // 1. DISPUTE RATE (Weight 30)
  // Ratio of disputes to total transactions in last 30 days, plus trend penalty
  const disputesLast30d = input.disputes.filter(
    (d) => new Date(d.openedAt) >= thirtyDaysAgo && new Date(d.openedAt) <= now
  );
  const disputesPrev30d = input.disputes.filter(
    (d) =>
      new Date(d.openedAt) >= sixtyDaysAgo &&
      new Date(d.openedAt) < thirtyDaysAgo
  );

  const txCount30d = Math.max(ordersLast30d.length, 1);
  const rawDisputeRatePct = (disputesLast30d.length / txCount30d) * 100;
  
  // Trend: if disputes are rising compared to previous 30 days
  const prevTxCount = Math.max(ordersPrev30d.length, 1);
  const prevDisputeRatePct = (disputesPrev30d.length / prevTxCount) * 100;
  const isTrendWorsening = rawDisputeRatePct > prevDisputeRatePct && disputesLast30d.length > 1;

  // PayPal risk threshold: 0.8% threshold starts warning; 1.5% is standard high risk; 2.5%+ is critical
  let normalizedDisputeScore = Math.min(Math.max((rawDisputeRatePct - 0.4) / 1.8, 0), 1);
  if (isTrendWorsening && normalizedDisputeScore > 0.2) {
    normalizedDisputeScore = Math.min(normalizedDisputeScore + 0.15, 1);
  }
  const disputeContribution = Number(
    (normalizedDisputeScore * activeWeights.disputeRate).toFixed(1)
  );

  // 2. MISSING TRACKING (Weight configured)
  // Share of physical orders older than 3 days with no tracking number
  const physicalOrdersOlderThan3d = input.orders.filter(
    (o) => new Date(o.createdAt) <= threeDaysAgo
  );
  const missingTrackingOrders = physicalOrdersOlderThan3d.filter(
    (o) => !o.trackingNumber || o.trackingNumber.trim() === ""
  );

  const missingTrackingRatio =
    physicalOrdersOlderThan3d.length > 0
      ? missingTrackingOrders.length / physicalOrdersOlderThan3d.length
      : 0;

  // 0% is safe; 10% is elevated; 30%+ is critical
  const normalizedTrackingScore = Math.min(
    Math.max((missingTrackingRatio - 0.05) / 0.28, 0),
    1
  );
  const trackingContribution = Number(
    (normalizedTrackingScore * activeWeights.missingTracking).toFixed(1)
  );

  // 3. VOLUME SPIKE (Weight configured)
  // Last 7 days sales vs trailing weekly average (or baseline)
  const salesLast7d = ordersLast7d.reduce((sum, o) => sum + o.amount, 0);
  // Estimate baseline weekly sales from the preceding 3 weeks
  const salesPrev3Weeks = input.orders
    .filter(
      (o) =>
        new Date(o.createdAt) >= new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000) &&
        new Date(o.createdAt) < sevenDaysAgo
    )
    .reduce((sum, o) => sum + o.amount, 0);
  const baselineWeeklySales = Math.max(salesPrev3Weeks / 3, 500); // minimum baseline
  const spikeRatio = salesLast7d / baselineWeeklySales;

  // 1.0x is normal; 1.8x is elevated; 3.0x+ is critical anomaly
  const normalizedSpikeScore = Math.min(
    Math.max((spikeRatio - 1.2) / 1.8, 0),
    1
  );
  const spikeContribution = Number(
    (normalizedSpikeScore * activeWeights.volumeSpike).toFixed(1)
  );

  // 4. ADDRESS MISMATCH (Weight configured)
  // Orders where shipping address differs from transaction address (voids Seller Protection)
  const addressMismatchOrders = ordersLast30d.filter(
    (o) => o.isAddressMismatch || o.sellerProtectionStatus === "NOT_ELIGIBLE"
  );
  const mismatchRatio =
    ordersLast30d.length > 0
      ? addressMismatchOrders.length / ordersLast30d.length
      : 0;

  // 0% safe; 5% warning; 15%+ critical
  const normalizedMismatchScore = Math.min(
    Math.max((mismatchRatio - 0.03) / 0.15, 0),
    1
  );
  const mismatchContribution = Number(
    (normalizedMismatchScore * activeWeights.addressMismatch).toFixed(1)
  );

  // 5. REFUND RATE (Weight configured)
  // Total refunds divided by total sales in last 30 days
  const totalRefunded30d = ordersLast30d.reduce(
    (sum, o) => sum + (o.refundedAmount || 0),
    0
  );
  const refundRatePct = salesLast30d > 0 ? (totalRefunded30d / salesLast30d) * 100 : 0;

  // 0-3% safe; 6% warning; 12%+ critical
  const normalizedRefundScore = Math.min(
    Math.max((refundRatePct - 3) / 9, 0),
    1
  );
  const refundContribution = Number(
    (normalizedRefundScore * activeWeights.refundRate).toFixed(1)
  );

  // 6. DISPUTE DEADLINES (Weight configured)
  // Open disputes with response due within 48 hours or overdue
  const openDisputes = input.disputes.filter((d) => d.status !== "RESOLVED");
  const urgentDisputes = openDisputes.filter(
    (d) => new Date(d.responseDueAt) <= fortyEightHoursFromNow
  );
  const normalizedDeadlineScore =
    urgentDisputes.length === 0
      ? 0
      : urgentDisputes.length === 1
      ? 0.5
      : 1.0;
  const deadlineContribution = Number(
    (normalizedDeadlineScore * activeWeights.disputeDeadlines).toFixed(1)
  );

  // Compute Total Raw Score (0 to 100)
  const totalScore = Math.round(
    disputeContribution +
      trackingContribution +
      spikeContribution +
      mismatchContribution +
      refundContribution +
      deadlineContribution
  );

  const boundedScore = Math.min(Math.max(totalScore, 0), 100);

  // Determine Risk Band: 0 to 33 Low, 34 to 66 Medium, 67 to 100 High
  let band: RiskBand = "LOW";
  if (boundedScore >= 67) {
    band = "HIGH";
  } else if (boundedScore >= 34) {
    band = "MEDIUM";
  } else {
    band = "LOW";
  }

  // Cash Flow Calculations
  // Low: 0% at risk, Medium: 10% at risk, High: 30% at risk (based on last 14d sales)
  let atRiskPercentage = 0;
  let expectedReleaseDays = 0;
  let expectedReleaseRange = "Immediate (No Active Holds)";

  if (band === "HIGH") {
    atRiskPercentage = 0.30;
    expectedReleaseDays = 60;
    expectedReleaseRange = "60-180 Days (Account Limitation / Max Reserve)";
  } else if (band === "MEDIUM") {
    atRiskPercentage = 0.10;
    expectedReleaseDays = 21;
    expectedReleaseRange = "14-21 Days (Rolling 10% Reserve)";
  }

  const atRiskAmount = Number(
    (trailing14dSales * atRiskPercentage).toFixed(2)
  );
  // Current cleared balance defaults to $14,250 or provided value minus holds
  const rawClearedBalance = input.currentBalance ?? Math.max(salesLast30d * 0.85, 3500);
  const clearedBalance = Number(
    Math.max(rawClearedBalance - atRiskAmount, 0).toFixed(2)
  );

  const cashFlow: CashFlowMetrics = {
    clearedBalance,
    atRiskAmount,
    trailing14dSales: Number(trailing14dSales.toFixed(2)),
    expectedReleaseDays,
    expectedReleaseRange,
  };

  const signals: RiskSignalsBreakdown = {
    disputeRate: {
      id: "dispute_rate",
      name: "Dispute Rate & Trend",
      weight: activeWeights.disputeRate,
      rawValue: Number(rawDisputeRatePct.toFixed(2)),
      displayValue: `${rawDisputeRatePct.toFixed(1)}%`,
      normalizedScore: Number(normalizedDisputeScore.toFixed(2)),
      contribution: disputeContribution,
      thresholds: { safe: 0.8, warning: 1.5, critical: 2.5 },
      status:
        normalizedDisputeScore > 0.6
          ? "CRITICAL"
          : normalizedDisputeScore > 0.2
          ? "ELEVATED"
          : "SAFE",
      affectedCount: disputesLast30d.length,
      description: `${disputesLast30d.length} dispute(s) in last 30d across ${txCount30d} orders. ${
        isTrendWorsening ? "Trend is deteriorating vs prior month." : "Trend is stable."
      }`,
    },
    missingTracking: {
      id: "missing_tracking",
      name: "Missing Tracking Numbers",
      weight: activeWeights.missingTracking,
      rawValue: Number((missingTrackingRatio * 100).toFixed(1)),
      displayValue: `${missingTrackingOrders.length} orders (${(
        missingTrackingRatio * 100
      ).toFixed(0)}%)`,
      normalizedScore: Number(normalizedTrackingScore.toFixed(2)),
      contribution: trackingContribution,
      thresholds: { safe: 5, warning: 15, critical: 30 },
      status:
        normalizedTrackingScore > 0.6
          ? "CRITICAL"
          : normalizedTrackingScore > 0.2
          ? "ELEVATED"
          : "SAFE",
      affectedCount: missingTrackingOrders.length,
      description: `${missingTrackingOrders.length} physical orders older than 3 days lack valid carrier tracking, triggering automated PayPal fulfillment reserves.`,
    },
    volumeSpike: {
      id: "volume_spike",
      name: "Sudden Volume Spike",
      weight: activeWeights.volumeSpike,
      rawValue: Number(spikeRatio.toFixed(2)),
      displayValue: `${spikeRatio.toFixed(1)}x baseline`,
      normalizedScore: Number(normalizedSpikeScore.toFixed(2)),
      contribution: spikeContribution,
      thresholds: { safe: 1.2, warning: 1.8, critical: 3.0 },
      status:
        normalizedSpikeScore > 0.6
          ? "CRITICAL"
          : normalizedSpikeScore > 0.2
          ? "ELEVATED"
          : "SAFE",
      affectedCount: ordersLast7d.length,
      description: `Sales in last 7 days ($${salesLast7d.toLocaleString()}) are ${spikeRatio.toFixed(
        1
      )}x the baseline ($${baselineWeeklySales.toLocaleString()}). Unannounced velocity spikes often trigger 21-day holds.`,
    },
    addressMismatch: {
      id: "address_mismatch",
      name: "Address Mismatch (Protection Voided)",
      weight: activeWeights.addressMismatch,
      rawValue: Number((mismatchRatio * 100).toFixed(1)),
      displayValue: `${addressMismatchOrders.length} orders (${(
        mismatchRatio * 100
      ).toFixed(0)}%)`,
      normalizedScore: Number(normalizedMismatchScore.toFixed(2)),
      contribution: mismatchContribution,
      thresholds: { safe: 3, warning: 8, critical: 15 },
      status:
        normalizedMismatchScore > 0.6
          ? "CRITICAL"
          : normalizedMismatchScore > 0.2
          ? "ELEVATED"
          : "SAFE",
      affectedCount: addressMismatchOrders.length,
      description: `${addressMismatchOrders.length} orders shipped to addresses differing from PayPal transaction addresses, completely forfeiting PayPal Seller Protection.`,
    },
    refundRate: {
      id: "refund_rate",
      name: "Refund Velocity",
      weight: activeWeights.refundRate,
      rawValue: Number(refundRatePct.toFixed(2)),
      displayValue: `${refundRatePct.toFixed(1)}% ($${totalRefunded30d.toFixed(0)})`,
      normalizedScore: Number(normalizedRefundScore.toFixed(2)),
      contribution: refundContribution,
      thresholds: { safe: 3, warning: 6, critical: 12 },
      status:
        normalizedRefundScore > 0.6
          ? "CRITICAL"
          : normalizedRefundScore > 0.2
          ? "ELEVATED"
          : "SAFE",
      affectedCount: ordersLast30d.filter((o) => o.refundedAmount > 0).length,
      description: `Refunds account for ${refundRatePct.toFixed(
        1
      )}% of monthly gross sales. Elevated refunds signal inventory shortage or quality dissatisfaction.`,
    },
    disputeDeadlines: {
      id: "dispute_deadlines",
      name: "Expiring Dispute Deadlines",
      weight: activeWeights.disputeDeadlines,
      rawValue: urgentDisputes.length,
      displayValue: `${urgentDisputes.length} urgent`,
      normalizedScore: Number(normalizedDeadlineScore.toFixed(2)),
      contribution: deadlineContribution,
      thresholds: { safe: 0, warning: 1, critical: 2 },
      status:
        normalizedDeadlineScore > 0.6
          ? "CRITICAL"
          : normalizedDeadlineScore > 0.2
          ? "ELEVATED"
          : "SAFE",
      affectedCount: urgentDisputes.length,
      description: `${urgentDisputes.length} dispute(s) expire within 48 hours. Missing a PayPal response deadline results in automatic buyer win and permanent defect mark.`,
    },
  };

  // Rank top factors by contribution descending
  const factorList = (
    Object.keys(signals) as Array<keyof RiskSignalsBreakdown>
  ).map((key) => {
    const s = signals[key];
    return {
      signalKey: key,
      name: s.name,
      contribution: s.contribution,
      impactDescription: s.description,
      affectedOrdersCount: s.affectedCount,
    };
  });

  factorList.sort((a, b) => b.contribution - a.contribution);

  return {
    score: boundedScore,
    band,
    signals,
    cashFlow,
    topFactors: factorList.slice(0, 3),
    evaluatedAt: now.toISOString(),
  };
}
