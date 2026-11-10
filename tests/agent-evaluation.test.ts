import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "../src/lib/db";
import { aiService, RiskExplanationSchema, ProposedActionsSchema, DisputeAppealSchema } from "../src/lib/ai/service";
import { evaluateRisk, RISK_WEIGHTS } from "../src/lib/risk/engine";
import { actionExecutor } from "../src/lib/actions/executor";
import { paypalClient } from "../src/lib/paypal/client";
import { executeAgentToolkitAction, PAYPAL_AGENT_TOOLS } from "../src/lib/paypal/agent-toolkit";
import { runSandboxE2EProof } from "../scripts/sandbox-e2e";

describe("Agent & Database & Guardrails Comprehensive Test Suite", () => {
  let testSellerId: string;

  beforeEach(async () => {
    // Clean up test data in correct cascade order
    await prisma.approval.deleteMany();
    await prisma.proposedAction.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.order.deleteMany();
    await prisma.explanation.deleteMany();
    await prisma.riskSnapshot.deleteMany();
    await prisma.webhookEvent.deleteMany();
    await prisma.seller.deleteMany();

    const seller = await prisma.seller.create({
      data: {
        paypalMerchantId: "MCH-AGENT-EVAL-01",
        displayName: "Agent Evaluation Test Store",
        sandboxMode: true,
      },
    });
    testSellerId = seller.id;
  });

  afterEach(async () => {
    // Clean up after test
    await prisma.approval.deleteMany();
    await prisma.proposedAction.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.order.deleteMany();
    await prisma.explanation.deleteMany();
    await prisma.riskSnapshot.deleteMany();
    await prisma.webhookEvent.deleteMany();
    await prisma.seller.deleteMany();
  });

  // =========================================================================
  // SECTION 1: AI AGENT BEHAVIOR UNDER N REAL-WORLD MERCHANT DATASETS
  // =========================================================================

  describe("1. AI Agent Multi-Scenario Evaluation with Real Merchant Datasets", () => {
    it("Scenario A (Drifting Merchant): proposes tracking uploads for orders > 3 days old", async () => {
      // 10 real-world style orders: 6 delivered with tracking, 4 older than 3 days missing tracking
      const now = Date.now();
      const orders = [
        // 4 problematic untracked orders (> 3 days old)
        {
          id: "ord_drift_1",
          paypalOrderId: "5O987112001",
          amount: 149.99,
          buyerEmail: "buyer1@example.com",
          trackingStatus: "NONE",
          isAddressMismatch: false,
          createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000),
          sellerProtectionStatus: "NOT_ELIGIBLE",
          refundedAmount: 0,
        },
        {
          id: "ord_drift_2",
          paypalOrderId: "5O987112002",
          amount: 89.50,
          buyerEmail: "buyer2@example.com",
          trackingStatus: "NONE",
          isAddressMismatch: false,
          createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
          sellerProtectionStatus: "NOT_ELIGIBLE",
          refundedAmount: 0,
        },
        {
          id: "ord_drift_3",
          paypalOrderId: "5O987112003",
          amount: 220.00,
          buyerEmail: "buyer3@example.com",
          trackingStatus: "NONE",
          isAddressMismatch: false,
          createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
          sellerProtectionStatus: "NOT_ELIGIBLE",
          refundedAmount: 0,
        },
        {
          id: "ord_drift_4",
          paypalOrderId: "5O987112004",
          amount: 65.00,
          buyerEmail: "buyer4@example.com",
          trackingStatus: "NONE",
          isAddressMismatch: false,
          createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
          sellerProtectionStatus: "NOT_ELIGIBLE",
          refundedAmount: 0,
        },
        // 6 compliant orders
        ...Array.from({ length: 6 }).map((_, i) => ({
          id: `ord_comp_${i}`,
          paypalOrderId: `5O98711210${i}`,
          amount: 110.0,
          buyerEmail: `clean_buyer_${i}@example.com`,
          trackingStatus: "SHIPPED",
          trackingNumber: `94001118995600000${i}`,
          isAddressMismatch: false,
          createdAt: new Date(now - (i + 1) * 24 * 60 * 60 * 1000),
          sellerProtectionStatus: "ELIGIBLE",
          refundedAmount: 0,
        })),
      ];

      const riskSnapshot = evaluateRisk({ orders, disputes: [] });
      expect(riskSnapshot.signals.missingTracking.normalizedScore).toBeGreaterThan(0.2);

      // AI Agent generates proposed actions
      const actions = await aiService.proposeActions(riskSnapshot, orders as any, []);

      // Verify schema adherence
      const validated = ProposedActionsSchema.parse({ actions });
      expect(validated.actions.length).toBeGreaterThan(0);

      // Verify agent specifically targeted missing tracking with correct carriers
      const trackingActions = validated.actions.filter((a) => a.type === "upload_tracking");
      expect(trackingActions.length).toBe(4);
      for (const act of trackingActions) {
        expect(act.priority).toBe(1);
        expect(act.payload.carrier).toBe("USPS");
        expect(act.payload.suggestedTrackingNumber).toBeDefined();
        expect(act.expectedRiskDrop).toBeGreaterThan(0);
      }
    });

    it("Scenario B (Dispute Crisis & Imminent Response Deadline): prioritizes dispute evidence submission", async () => {
      const now = Date.now();
      const problematicOrders = [
        {
          id: "ord_disp_1",
          paypalOrderId: "PP-DISP-ORD-01",
          amount: 250.0,
          buyerEmail: "dispute_buyer@example.com",
          trackingStatus: "SHIPPED",
          isAddressMismatch: false,
          createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
          sellerProtectionStatus: "ELIGIBLE",
          refundedAmount: 0,
        },
      ];

      const openDisputes = [
        {
          id: "disp_critical_1",
          paypalDisputeId: "PP-D-8839120",
          orderId: "ord_disp_1",
          amount: 250.0,
          reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
          responseDueAt: new Date(now + 12 * 60 * 60 * 1000).toISOString(), // < 24h away
        },
      ];

      const riskSnapshot = evaluateRisk({
        orders: problematicOrders as any,
        disputes: openDisputes.map((d) => ({
          ...d,
          status: "WAITING_FOR_SELLER",
          openedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
          responseDueAt: new Date(d.responseDueAt),
        })),
      });

      // AI generates explanation & actions
      const explanation = await aiService.explainRisk(riskSnapshot, problematicOrders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
      })));

      // Validate explanation schema
      const validExpl = RiskExplanationSchema.parse(explanation);
      expect(validExpl.headline).toBeDefined();
      expect(validExpl.topThreeReasons.length).toBeGreaterThan(0);
      expect(["MEDIUM", "HIGH", "CRITICAL"]).toContain(validExpl.urgencyLevel);

      const actions = await aiService.proposeActions(riskSnapshot, problematicOrders as any, openDisputes);
      const disputeAction = actions.find((a) => a.type === "draft_reply");
      expect(disputeAction).toBeDefined();
      expect(disputeAction?.priority).toBe(1);
      expect(disputeAction?.targetId).toBe("disp_critical_1");
      expect(disputeAction?.payload.action).toBe("SUBMIT_EVIDENCE");
    });

    it("Scenario C (Velocity Volume Surge): warns against velocity hold and proposes pre-notification", async () => {
      const now = Date.now();
      // Surge: 40 orders in the last 7 days vs 10 orders in prior 7 days (> 3x surge)
      const recentOrders = Array.from({ length: 40 }).map((_, i) => ({
        id: `ord_spike_${i}`,
        paypalOrderId: `PP-SPIKE-${i}`,
        amount: 80.0,
        buyerEmail: `buyer_spike_${i}@example.com`,
        trackingStatus: "SHIPPED",
        trackingNumber: `94001118995699990${i}`,
        isAddressMismatch: false,
        createdAt: new Date(now - (i % 6 + 1) * 24 * 60 * 60 * 1000), // last 6 days
        sellerProtectionStatus: "ELIGIBLE",
        refundedAmount: 0,
      }));

      const priorOrders = Array.from({ length: 10 }).map((_, i) => ({
        id: `ord_prior_${i}`,
        paypalOrderId: `PP-PRIOR-${i}`,
        amount: 80.0,
        buyerEmail: `buyer_prior_${i}@example.com`,
        trackingStatus: "SHIPPED",
        trackingNumber: `94001118995688880${i}`,
        isAddressMismatch: false,
        createdAt: new Date(now - (i % 6 + 8) * 24 * 60 * 60 * 1000), // days 8-13
        sellerProtectionStatus: "ELIGIBLE",
        refundedAmount: 0,
      }));

      const allOrders = [...recentOrders, ...priorOrders];
      const riskSnapshot = evaluateRisk({ orders: allOrders as any, disputes: [] });

      expect(riskSnapshot.signals.volumeSpike.normalizedScore).toBeGreaterThan(0.4);

      const actions = await aiService.proposeActions(riskSnapshot, [], []);
      const spikeAction = actions.find((a) => a.type === "pre_notify_spike");
      expect(spikeAction).toBeDefined();
      expect(spikeAction?.title).toContain("Pre-Promotion Notification");
      expect(spikeAction?.payload.recommendedForm).toContain("PayPal Business Support");
    });

    it("Scenario D (Address Mismatch / Fraud Vulnerability): proposes preemptive refund to preserve seller protection", async () => {
      const problematicOrders = [
        {
          id: "ord_mismatch_1",
          paypalOrderId: "PP-MISMATCH-99",
          amount: 199.95,
          buyerEmail: "mismatch_buyer@example.com",
          trackingStatus: "SHIPPED",
          isAddressMismatch: true,
          createdAt: new Date(),
          sellerProtectionStatus: "NOT_ELIGIBLE",
          refundedAmount: 0,
        },
      ];

      const riskSnapshot = evaluateRisk({ orders: problematicOrders as any, disputes: [] });
      const actions = await aiService.proposeActions(riskSnapshot, problematicOrders as any, []);

      const refundAction = actions.find((a) => a.type === "refund");
      expect(refundAction).toBeDefined();
      expect(refundAction?.targetId).toBe("ord_mismatch_1");
      expect(refundAction?.payload.amount).toBe(199.95);
      expect(refundAction?.rationale).toContain("unconfirmed address");
    });

    it("Scenario E (Healthy Compliant Merchant): accurately returns LOW risk band and zero cash at risk", async () => {
      const now = Date.now();
      const cleanOrders = Array.from({ length: 30 }).map((_, i) => ({
        id: `ord_clean_${i}`,
        paypalOrderId: `PP-CLEAN-${i}`,
        amount: 120.0,
        buyerEmail: `buyer_clean_${i}@example.com`,
        trackingStatus: "DELIVERED",
        trackingNumber: `94001118995677770${i}`,
        isAddressMismatch: false,
        createdAt: new Date(now - (i + 1) * 24 * 60 * 60 * 1000),
        sellerProtectionStatus: "ELIGIBLE",
        refundedAmount: 0,
      }));

      const snapshot = evaluateRisk({ orders: cleanOrders as any, disputes: [] });
      expect(snapshot.score).toBeLessThanOrEqual(33);
      expect(snapshot.band).toBe("LOW");
      expect(snapshot.cashFlow.atRiskAmount).toBe(0);

      const explanation = await aiService.explainRisk(snapshot, cleanOrders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
      })));
      expect(explanation.urgencyLevel).toBe("LOW");
      expect(explanation.reserveImpactSummary).toContain("Zero funds placed in rolling reserves");
    });

    it("Scenario F (Dispute Appeal Drafter): formats legal proof with verified delivery telemetry", async () => {
      const appeal = await aiService.draftDisputeAppeal({
        disputeReason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
        orderAmount: 185.50,
        carrier: "FedEx Ground",
        trackingNumber: "74890284729184",
        deliveryDate: "November 8, 2026 at 11:32 AM",
      });

      const validAppeal = DisputeAppealSchema.parse(appeal);
      expect(validAppeal.subject).toContain("Formal Evidence Submission");
      expect(validAppeal.appealBody).toContain("FedEx Ground");
      expect(validAppeal.appealBody).toContain("74890284729184");
      expect(validAppeal.appealBody).toContain("PayPal Seller Protection Policy");
      expect(validAppeal.evidenceList.length).toBeGreaterThanOrEqual(3);
      expect(validAppeal.confidenceRating).toContain("Strong Evidence");
    });
  });

  // =========================================================================
  // SECTION 2: DATABASE INTEGRITY & TRANSACTION AUDITING (NO SCHEMA CHANGES)
  // =========================================================================

  describe("2. Database Transactions, Foreign Keys & Audit Trail", () => {
    it("persists entire operational cycle without schema modifications", async () => {
      // 1. Create Order
      const order = await prisma.order.create({
        data: {
          sellerId: testSellerId,
          paypalOrderId: "PP-DB-CYCLE-01",
          amount: 275.0,
          currency: "USD",
          buyerEmail: "db_audit@example.com",
          shipToAddress: "456 Market St, San Francisco, CA",
          transactionAddress: "456 Market St, San Francisco, CA",
          trackingStatus: "NONE",
          source: "SIMULATED",
        },
      });
      expect(order.id).toBeDefined();

      // 2. Create Dispute
      const dispute = await prisma.dispute.create({
        data: {
          paypalDisputeId: "PP-DISP-CYCLE-01",
          orderId: order.id,
          reason: "UNAUTHORISED",
          status: "WAITING_FOR_SELLER",
          amount: 275.0,
          responseDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          source: "SIMULATED",
        },
      });
      expect(dispute.id).toBeDefined();

      // 3. Create RiskSnapshot & Explanation
      const snapshot = await prisma.riskSnapshot.create({
        data: {
          sellerId: testSellerId,
          score: 72,
          band: "HIGH",
          signalsJson: JSON.stringify({ disputeRate: { score: 25 } }),
          cashAvailable: 5000.0,
          cashAtRisk: 1500.0,
          expectedReleaseDays: 60,
        },
      });

      const explanation = await prisma.explanation.create({
        data: {
          snapshotId: snapshot.id,
          text: "High risk due to unauthorized claim.",
          topReasonsJson: JSON.stringify([{ rank: 1, title: "Dispute Spike" }]),
        },
      });
      expect(explanation.id).toBeDefined();

      // 4. Create ProposedAction
      const action = await prisma.proposedAction.create({
        data: {
          title: "Submit Evidence for Unauthorized Claim",
          type: "draft_reply",
          orderId: order.id,
          disputeId: dispute.id,
          payloadJson: JSON.stringify({ appealBody: "Signed delivery proof" }),
          rationale: "Protect $275 transaction",
          priority: 1,
          expectedRiskDrop: 8,
          status: "proposed",
          source: "SIMULATED",
        },
      });

      // 5. Create Approval
      const approval = await prisma.approval.create({
        data: {
          actionId: action.id,
          approvedBy: "merchant_ops",
          decision: "approved",
          executionResult: JSON.stringify({ success: true }),
        },
      });
      expect(approval.id).toBeDefined();

      // 6. Create AuditLog
      const audit = await prisma.auditLog.create({
        data: {
          actor: "merchant_ops",
          event: "ACTION_APPROVED_AND_EXECUTED",
          detailsJson: JSON.stringify({ actionId: action.id, approved: true }),
        },
      });
      expect(audit.id).toBeDefined();

      // 7. Verify relations queries
      const fetchedAction = await prisma.proposedAction.findUnique({
        where: { id: action.id },
        include: { order: true, dispute: true, approvals: true },
      });
      expect(fetchedAction?.order?.paypalOrderId).toBe("PP-DB-CYCLE-01");
      expect(fetchedAction?.dispute?.paypalDisputeId).toBe("PP-DISP-CYCLE-01");
      expect(fetchedAction?.approvals.length).toBe(1);
    });

    it("verifies webhook deduplication and unique constraint idempotency", async () => {
      const eventId = `WH-EVT-UNIQUE-${Date.now()}`;

      // First webhook insert must succeed
      const event1 = await prisma.webhookEvent.create({
        data: {
          paypalEventId: eventId,
          eventType: "PAYMENT.CAPTURE.COMPLETED",
          payload: JSON.stringify({ id: "CAP-001" }),
          status: "processed",
          source: "SIMULATED",
        },
      });
      expect(event1.id).toBeDefined();

      // Duplicate webhook with same paypalEventId must fail unique constraint
      await expect(
        prisma.webhookEvent.create({
          data: {
            paypalEventId: eventId,
            eventType: "PAYMENT.CAPTURE.COMPLETED",
            payload: JSON.stringify({ id: "CAP-001-DUP" }),
            status: "processed",
            source: "SIMULATED",
          },
        })
      ).rejects.toThrow();
    });

    it("verifies clean cascade deletions when seller is removed", async () => {
      const order = await prisma.order.create({
        data: {
          sellerId: testSellerId,
          paypalOrderId: "PP-CASCADE-01",
          amount: 50.0,
          buyerEmail: "cascade@example.com",
          shipToAddress: "123 Test Ave",
          transactionAddress: "123 Test Ave",
        },
      });

      await prisma.riskSnapshot.create({
        data: {
          sellerId: testSellerId,
          score: 10,
          band: "LOW",
          signalsJson: "{}",
          cashAvailable: 1000,
          cashAtRisk: 0,
          expectedReleaseDays: 0,
        },
      });

      // Deleting seller must cascade delete its orders and risk snapshots
      await prisma.seller.delete({ where: { id: testSellerId } });

      const remainingOrders = await prisma.order.findMany({ where: { sellerId: testSellerId } });
      const remainingSnapshots = await prisma.riskSnapshot.findMany({ where: { sellerId: testSellerId } });
      expect(remainingOrders.length).toBe(0);
      expect(remainingSnapshots.length).toBe(0);
    });
  });

  // =========================================================================
  // SECTION 3: GUARDRAILS, AUTHENTICATION & EXECUTION PATHS
  // =========================================================================

  describe("3. Guardrails, Authorization & Safe Execution Controls", () => {
    it("blocks execution of an action that was previously rejected by the merchant", async () => {
      const order = await prisma.order.create({
        data: {
          sellerId: testSellerId,
          paypalOrderId: "PP-GUARD-REJ-01",
          amount: 100.0,
          buyerEmail: "guard_rej@example.com",
          shipToAddress: "1st St",
          transactionAddress: "1st St",
        },
      });

      const action = await prisma.proposedAction.create({
        data: {
          type: "refund",
          orderId: order.id,
          payloadJson: JSON.stringify({ amount: 100.0 }),
          rationale: "Preemptive refund test",
          status: "proposed",
        },
      });

      // Reject the action
      await actionExecutor.rejectAction(action.id, "risk_manager");

      const rejectedAction = await prisma.proposedAction.findUnique({
        where: { id: action.id },
      });
      expect(rejectedAction?.status).toBe("rejected");

      // Attempting to execute a rejected action must be blocked
      const execResult = await actionExecutor.approveAndExecute(action.id, "attacker_or_bug");
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain("Action was previously rejected");
    });

    it("strictly blocks refund amounts exceeding the remaining order balance", async () => {
      const order = await prisma.order.create({
        data: {
          sellerId: testSellerId,
          paypalOrderId: "PP-GUARD-CAP-01",
          amount: 50.0,
          refundedAmount: 20.0, // Only $30 remaining eligible
          buyerEmail: "guard_cap@example.com",
          shipToAddress: "1st St",
          transactionAddress: "1st St",
        },
      });

      const action = await prisma.proposedAction.create({
        data: {
          type: "refund",
          orderId: order.id,
          payloadJson: JSON.stringify({ amount: 35.0 }), // Requests $35, exceeds $30 remaining
          rationale: "Exceeding refund test",
          status: "proposed",
        },
      });

      const result = await actionExecutor.approveAndExecute(action.id, "seller");
      expect(result.success).toBe(false);
      expect(result.message).toContain("exceeds remaining order balance");

      const dbAction = await prisma.proposedAction.findUnique({ where: { id: action.id } });
      expect(dbAction?.status).toBe("failed");
    });

    it("dispatches through PayPal Agent Toolkit MCP specifications with standard tool schema", async () => {
      // Test the MCP Tool schema registry
      expect(PAYPAL_AGENT_TOOLS.paypal_upload_tracking).toBeDefined();
      expect(PAYPAL_AGENT_TOOLS.paypal_upload_tracking.parameters.required).toContain("tracking_number");
      expect(PAYPAL_AGENT_TOOLS.paypal_issue_refund).toBeDefined();
      expect(PAYPAL_AGENT_TOOLS.paypal_submit_dispute_evidence).toBeDefined();

      // Test execution via Agent Toolkit dispatch
      const agentRes = await executeAgentToolkitAction("paypal_upload_tracking", {
        transaction_id: "PP-TX-TEST-MCP-99",
        tracking_number: "9400111899564829104829",
        carrier: "USPS",
        status: "SHIPPED",
      });

      expect(agentRes.success).toBe(true);
      expect(agentRes.executionChannel).toBe("PAYPAL_AGENT_TOOLKIT");
      expect(agentRes.agentTrace.protocol).toBe("PAYPAL_AGENT_TOOLKIT");
      expect(agentRes.agentTrace.auditHash).toBeDefined();
      expect(agentRes.toolResult.status).toBe("SHIPPED");
    });

    it("verifies webhook cryptographic signature headers and payloads", async () => {
      const verified = await paypalClient.verifyWebhookSignature({
        authAlgo: "SHA256withRSA",
        certUrl: "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-SANDBOX",
        transmissionId: "WH-TX-VERIFY-123",
        transmissionSig: "valid_sha256_rsa_transmission_signature",
        transmissionTime: new Date().toISOString(),
        webhookEvent: {
          id: "WH-EVT-PAYMENT-001",
          event_type: "PAYMENT.CAPTURE.COMPLETED",
        },
      });

      expect(verified).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 4: REAL PAYPAL SANDBOX END-TO-END PROOF VERIFICATION
  // =========================================================================

  describe("4. End-to-End PayPal Sandbox Proof Cycle", () => {
    it("successfully runs all 5 steps of the PayPal Sandbox verification cycle", async () => {
      const result = await runSandboxE2EProof();

      expect(result.overallStatus).toBe("SUCCESS");
      expect(result.step1_order.success).toBe(true);
      expect(result.step1_order.orderId).toBeDefined();

      expect(result.step2_tracking.success).toBe(true);
      expect(result.step2_tracking.trackingNumber).toBeDefined();
      expect(result.step2_tracking.status).toBe("SHIPPED");

      expect(result.step3_refund.success).toBe(true);
      expect(result.step3_refund.refundId).toBeDefined();

      expect(result.step4_disputes.success).toBe(true);
      expect(result.step5_webhook.success).toBe(true);

      // Verify that audit log recorded the proof execution
      const proofLog = await prisma.auditLog.findFirst({
        where: { event: "E2E_SANDBOX_PROOF_EXECUTED" },
      });
      expect(proofLog).toBeDefined();
      const details = JSON.parse(proofLog!.detailsJson);
      expect(details.allStepsPassed).toBe(true);
    });
  });
});
