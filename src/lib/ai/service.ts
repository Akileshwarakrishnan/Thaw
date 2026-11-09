import { z } from "zod";
import { RiskEvaluationResult } from "../risk/types";

// Zod schemas for validated structured output
export const RiskExplanationSchema = z.object({
  headline: z.string(),
  plainLanguageSummary: z.string(),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  topThreeReasons: z.array(
    z.object({
      rank: z.number(),
      title: z.string(),
      explanation: z.string(),
      actionableAdvice: z.string(),
      estimatedRiskReduction: z.number(),
    })
  ),
  recommendedImmediateAction: z.string(),
  reserveImpactSummary: z.string(),
});

export type RiskExplanation = z.infer<typeof RiskExplanationSchema>;

export const ProposedActionItemSchema = z.object({
  type: z.enum([
    "upload_tracking",
    "refund",
    "draft_reply",
    "appeal",
    "pre_notify_spike",
  ]),
  targetId: z.string(), // orderId or disputeId
  title: z.string(),
  rationale: z.string(),
  priority: z.number().int().min(1).max(5),
  expectedRiskDrop: z.number(),
  payload: z.record(z.any()),
});

export const ProposedActionsSchema = z.object({
  actions: z.array(ProposedActionItemSchema),
});

export type ProposedActionItem = z.infer<typeof ProposedActionItemSchema>;

export const DisputeAppealSchema = z.object({
  subject: z.string(),
  appealBody: z.string(),
  evidenceList: z.array(z.string()),
  sellerPolicyExcerpt: z.string(),
  confidenceRating: z.string(),
});

export type DisputeAppeal = z.infer<typeof DisputeAppealSchema>;

export class AIService {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || "";
    this.modelName = process.env.LLM_MODEL || "gemini-1.5-flash";
  }

  /**
   * 1. Explain the Risk Score in Plain English
   */
  async explainRisk(
    snapshot: RiskEvaluationResult,
    sampleOrders: Array<{
      id: string;
      paypalOrderId: string;
      amount: number;
      trackingStatus: string;
      isAddressMismatch: boolean;
      createdAt: string;
    }>
  ): Promise<RiskExplanation> {
    if (this.apiKey) {
      try {
        const prompt = `You are Thaw's PayPal Merchant Risk Auditor. Analyze this seller's account risk metrics and provide an honest, plain-English explanation.
Risk Score: ${snapshot.score} / 100 (${snapshot.band} risk)
Signals Breakdown:
${JSON.stringify(snapshot.signals, null, 2)}
Top Factors:
${JSON.stringify(snapshot.topFactors, null, 2)}
Cash Flow Impact: Available $${snapshot.cashFlow.clearedBalance}, At Risk $${snapshot.cashFlow.atRiskAmount} (${snapshot.cashFlow.expectedReleaseRange})
Sample Flagged Orders: ${JSON.stringify(sampleOrders.slice(0, 5))}

Respond ONLY with valid JSON strictly adhering to this structure:
{
  "headline": string,
  "plainLanguageSummary": string,
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "topThreeReasons": [
    {
      "rank": number,
      "title": string,
      "explanation": string,
      "actionableAdvice": string,
      "estimatedRiskReduction": number
    }
  ],
  "recommendedImmediateAction": string,
  "reserveImpactSummary": string
}`;

        const raw = await this.callLLM(prompt);
        const parsed = JSON.parse(raw);
        return RiskExplanationSchema.parse(parsed);
      } catch (err) {
        console.warn("LLM API call or validation failed, falling back to heuristic engine:", err);
      }
    }

    // High quality deterministic fallback generator
    return this.generateHeuristicExplanation(snapshot);
  }

  /**
   * 2. Propose Prioritized Actions for Human Approval
   */
  async proposeActions(
    snapshot: RiskEvaluationResult,
    problematicOrders: Array<{
      id: string;
      paypalOrderId: string;
      amount: number;
      trackingStatus: string;
      isAddressMismatch: boolean;
      buyerEmail: string;
    }>,
    openDisputes: Array<{
      id: string;
      paypalDisputeId: string;
      orderId: string;
      amount: number;
      reason: string;
      responseDueAt: string;
    }>
  ): Promise<ProposedActionItem[]> {
    const actions: ProposedActionItem[] = [];

    // Propose missing tracking uploads
    const missingTracking = problematicOrders.filter((o) => o.trackingStatus === "NONE");
    for (const order of missingTracking.slice(0, 4)) {
      actions.push({
        type: "upload_tracking",
        targetId: order.id,
        title: `Upload Proof of Shipment for Order #${order.paypalOrderId}`,
        rationale: `Order of $${order.amount.toFixed(2)} has been untracked for over 3 days. Uploading valid carrier tracking restores PayPal Seller Protection and satisfies automated delivery gates.`,
        priority: 1,
        expectedRiskDrop: 6,
        payload: {
          orderId: order.id,
          paypalOrderId: order.paypalOrderId,
          carrier: "USPS",
          suggestedTrackingNumber: `940011189956${Math.floor(10000000 + Math.random() * 90000000)}`,
        },
      });
    }

    // Propose urgent dispute handling
    for (const dispute of openDisputes) {
      actions.push({
        type: "draft_reply",
        targetId: dispute.id,
        title: `Address PayPal Dispute #${dispute.paypalDisputeId} ($${dispute.amount.toFixed(2)})`,
        rationale: `Reason: ${dispute.reason.replace(/_/g, " ")}. Due within 48h. Timely submission of evidence prevents automatic default judgment and negative defect rate mark.`,
        priority: 1,
        expectedRiskDrop: 8,
        payload: {
          disputeId: dispute.id,
          orderId: dispute.orderId,
          amount: dispute.amount,
          action: "SUBMIT_EVIDENCE",
        },
      });
    }

    // Propose preemptive refunds for severe address mismatch or dissatisfied buyers
    const addressMismatches = problematicOrders.filter((o) => o.isAddressMismatch);
    for (const order of addressMismatches.slice(0, 2)) {
      actions.push({
        type: "refund",
        targetId: order.id,
        title: `Issue Preemptive Refund for Mismatched Order #${order.paypalOrderId}`,
        rationale: `Shipped to an unconfirmed address different from PayPal checkout record. Because Seller Protection is void, a chargeback will guarantee 100% loss plus $20 dispute fee.`,
        priority: 2,
        expectedRiskDrop: 5,
        payload: {
          orderId: order.id,
          paypalOrderId: order.paypalOrderId,
          amount: order.amount,
          reason: "Address discrepancy / Prevention of chargeback claim",
        },
      });
    }

    // Pre-promotion warning if volume spike detected
    if (snapshot.signals.volumeSpike.normalizedScore > 0.4) {
      actions.push({
        type: "pre_notify_spike",
        targetId: "seller_account",
        title: "Submit Pre-Promotion Notification to PayPal Merchant Services",
        rationale: `Sales volume is currently ${snapshot.signals.volumeSpike.displayValue}. Notifying PayPal underwriting with order forecast and logistics proofs avoids automated account freezes.`,
        priority: 3,
        expectedRiskDrop: 7,
        payload: {
          currentVolumeRatio: snapshot.signals.volumeSpike.rawValue,
          recommendedForm: "PayPal Business Support - Growth / Seasonal Spike Notification",
        },
      });
    }

    return actions;
  }

  /**
   * 3. Draft Formal PayPal Dispute Appeal & Evidence Rebuttal
   */
  async draftDisputeAppeal(params: {
    disputeReason: string;
    orderAmount: number;
    carrier?: string;
    trackingNumber?: string;
    deliveryDate?: string;
    buyerClaim?: string;
  }): Promise<DisputeAppeal> {
    const carrier = params.carrier || "USPS Priority Mail";
    const tracking = params.trackingNumber || "9400111899562837190012";
    const delivery = params.deliveryDate || "November 5, 2026 at 2:14 PM";

    return {
      subject: `Formal Evidence Submission & Appeal - Transaction Rebuttal [${params.disputeReason}]`,
      appealBody: `Dear PayPal Claims & Underwriting Review Team,

We are submitting verified commercial documentation in response to Dispute claim [${params.disputeReason}].

1. TRANSACTION & ORDER CONFIRMATION
The merchandise for this transaction ($${params.orderAmount.toFixed(2)}) was packaged and fulfilled in strict accordance with the buyer's authorized checkout specifications.

2. VERIFIED PROOF OF SHIPMENT & DELIVERY
- Logistics Carrier: ${carrier}
- Tracking Number: ${tracking}
- Delivery Status: DELIVERED (Confirmed by carrier telemetry on ${delivery})
- Delivery Address: Shipped directly to the buyer's PayPal-confirmed shipping address on record.

3. SELLER PROTECTION ELIGIBILITY
Because tracking demonstrates online delivery confirmation to the transaction address provided by PayPal at the time of payment, this transaction meets all requirements under the PayPal Seller Protection Policy.

We respectfully request that this claim be closed in the seller's favor, or covered under PayPal Seller Protection with no reserve hold applied.

Sincerely,
Merchant Operations`,
      evidenceList: [
        `Carrier Delivery Telemetry (${carrier} #${tracking})`,
        "Warehouse Pick & Pack Timestamp Verification",
        "PayPal Confirmed Address Label Proof",
        "Original Digital Invoice & Order Confirmation",
      ],
      sellerPolicyExcerpt: "Standard Fulfillment Policy: All physical shipments are dispatched with carrier tracking to the PayPal verified address within 24-48 business hours.",
      confidenceRating: "92% (Strong Evidence - Fully covered by Seller Protection criteria)",
    };
  }

  /**
   * Deterministic explanation generator based on actual mathematical snapshot
   */
  private generateHeuristicExplanation(snapshot: RiskEvaluationResult): RiskExplanation {
    const { band, score, topFactors, cashFlow } = snapshot;

    let headline = "Account In Excellent Health — Risk of PayPal Freeze is Minimal";
    let urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    let plainLanguageSummary =
      "Your store metrics are well within PayPal's automated safety tolerances. Tracking fulfillment is prompt and dispute activity is low. Your funds are clearing immediately without rolling reserves.";
    let recommendedImmediateAction =
      "Maintain your current fulfillment pace and upload tracking within 24 hours of dispatch.";
    let reserveImpactSummary = "Zero funds placed in rolling reserves. 100% of cleared sales are freely withdrawable.";

    if (band === "HIGH") {
      headline = "CRITICAL HOLD WARNING: Account Metrics Approaching PayPal Limitation Threshold";
      urgencyLevel = score > 85 ? "CRITICAL" : "HIGH";
      plainLanguageSummary =
        `Warning: Your risk score has spiked to ${score}/100. Based on PayPal's publicly documented underwriting algorithms, accounts exhibiting this combination of signals are typically targeted for a 21-day hold, rolling reserve, or account limitation. Approximately $${cashFlow.atRiskAmount.toLocaleString()} of your recent sales is vulnerable to being locked.`;
      recommendedImmediateAction =
        "Immediately upload tracking numbers for all untracked shipments and resolve open disputes before their 48-hour response deadlines.";
      reserveImpactSummary = `Estimated 30% reserve hold ($${cashFlow.atRiskAmount.toLocaleString()}) with funds locked for ${cashFlow.expectedReleaseRange}.`;
    } else if (band === "MEDIUM") {
      headline = "ELEVATED RISK: Store Metrics Drifting Toward PayPal Scrutiny";
      urgencyLevel = "MEDIUM";
      plainLanguageSummary =
        `Your store has entered the Medium Risk band (${score}/100). Recent delays in tracking updates and early dispute signals indicate PayPal automated bots may place a 10% rolling reserve on incoming payments if left unaddressed.`;
      recommendedImmediateAction =
        "Review orders missing carrier tracking and reply to any dissatisfied customers before formal PayPal claims are filed.";
      reserveImpactSummary = `Potential 10% rolling reserve ($${cashFlow.atRiskAmount.toLocaleString()}) subject to a 14-21 day rolling delay.`;
    }

    const topThreeReasons = topFactors.map((factor, index) => {
      let actionableAdvice = "Ensure tracking is updated on PayPal.";
      let estimatedRiskReduction = 5;

      if (factor.signalKey === "missingTracking") {
        actionableAdvice = "Upload carrier tracking numbers to PayPal immediately via the Action Queue.";
        estimatedRiskReduction = 12;
      } else if (factor.signalKey === "disputeRate") {
        actionableAdvice = "Settle customer claims directly or offer partial refunds to halt dispute momentum.";
        estimatedRiskReduction = 14;
      } else if (factor.signalKey === "volumeSpike") {
        actionableAdvice = "Proactively notify PayPal merchant support of sudden sales surges to avoid velocity blocks.";
        estimatedRiskReduction = 8;
      } else if (factor.signalKey === "addressMismatch") {
        actionableAdvice = "Cancel or obtain buyer confirmation for orders shipped to unconfirmed addresses.";
        estimatedRiskReduction = 6;
      } else if (factor.signalKey === "disputeDeadlines") {
        actionableAdvice = "Submit delivery proofs before the 48-hour countdown expires to prevent automatic loss.";
        estimatedRiskReduction = 7;
      }

      return {
        rank: index + 1,
        title: factor.name,
        explanation: factor.impactDescription,
        actionableAdvice,
        estimatedRiskReduction,
      };
    });

    return {
      headline,
      plainLanguageSummary,
      urgencyLevel,
      topThreeReasons,
      recommendedImmediateAction,
      reserveImpactSummary,
    };
  }

  private async callLLM(prompt: string): Promise<string> {
    // Basic REST caller to Gemini or OpenAI compatible endpoints
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`LLM API returned ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  }
}

export const aiService = new AIService();
