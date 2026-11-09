import { describe, it, expect } from "vitest";
import { evaluateRisk, RISK_WEIGHTS } from "../src/lib/risk/engine";

describe("Risk Engine Unit Tests", () => {
  const baseOrder = {
    id: "ord_1",
    paypalOrderId: "PP_1",
    amount: 100,
    createdAt: new Date(),
    trackingStatus: "DELIVERED",
    trackingNumber: "TRK12345",
    isAddressMismatch: false,
    sellerProtectionStatus: "ELIGIBLE",
    refundedAmount: 0,
  };

  it("should have correct signal weights summing to 100", () => {
    const totalWeight = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(totalWeight).toBe(100);
    expect(RISK_WEIGHTS.disputeRate).toBe(30);
    expect(RISK_WEIGHTS.missingTracking).toBe(25);
    expect(RISK_WEIGHTS.volumeSpike).toBe(20);
    expect(RISK_WEIGHTS.addressMismatch).toBe(10);
    expect(RISK_WEIGHTS.refundRate).toBe(10);
    expect(RISK_WEIGHTS.disputeDeadlines).toBe(5);
  });

  it("evaluates a perfectly clean store in LOW risk band (score <= 33)", () => {
    const orders = Array.from({ length: 30 }).map((_, i) => ({
      ...baseOrder,
      id: `ord_${i}`,
      paypalOrderId: `PP_${i}`,
      createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
      trackingNumber: `940011189956${i}`,
    }));

    const result = evaluateRisk({ orders, disputes: [] });

    expect(result.score).toBeLessThanOrEqual(33);
    expect(result.band).toBe("LOW");
    expect(result.cashFlow.atRiskAmount).toBe(0);
    expect(result.cashFlow.expectedReleaseDays).toBe(0);
  });

  it("evaluates an account with high disputes and missing tracking in HIGH risk band (score >= 67)", () => {
    const orders = Array.from({ length: 25 }).map((_, i) => ({
      ...baseOrder,
      id: `ord_${i}`,
      paypalOrderId: `PP_${i}`,
      createdAt: new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000), // > 3 days old
      trackingNumber: null, // all missing tracking
      trackingStatus: "NONE",
      isAddressMismatch: i % 2 === 0, // 50% address mismatches
    }));

    const disputes = [
      {
        id: "disp_1",
        paypalDisputeId: "PP_DISP_1",
        orderId: "ord_1",
        amount: 150,
        status: "WAITING_FOR_SELLER",
        openedAt: new Date(),
        responseDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expiring in 24h
        reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      },
      {
        id: "disp_2",
        paypalDisputeId: "PP_DISP_2",
        orderId: "ord_2",
        amount: 200,
        status: "WAITING_FOR_SELLER",
        openedAt: new Date(),
        responseDueAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // expiring in 12h
        reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      },
    ];

    const result = evaluateRisk({ orders, disputes });

    expect(result.score).toBeGreaterThanOrEqual(67);
    expect(result.band).toBe("HIGH");
    expect(result.cashFlow.expectedReleaseDays).toBe(60);
    // 30% of trailing 14d sales estimated at risk
    expect(result.cashFlow.atRiskAmount).toBeGreaterThan(0);
  });

  it("calculates cash-flow estimates accurately per band specs", () => {
    const now = new Date();
    // 10 orders of $100 in last 14 days = $1,000 trailing 14d sales
    const orders = Array.from({ length: 10 }).map((_, i) => ({
      ...baseOrder,
      id: `ord_${i}`,
      paypalOrderId: `PP_${i}`,
      amount: 100,
      createdAt: new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000),
    }));

    const cleanResult = evaluateRisk({ orders, disputes: [] });
    // LOW band: 0% at risk
    expect(cleanResult.band).toBe("LOW");
    expect(cleanResult.cashFlow.trailing14dSales).toBe(1000);
    expect(cleanResult.cashFlow.atRiskAmount).toBe(0);
  });
});
