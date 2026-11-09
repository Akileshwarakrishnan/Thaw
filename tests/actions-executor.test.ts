import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../src/lib/db";
import { actionExecutor } from "../src/lib/actions/executor";

describe("Action Executor Guardrails & Approvals", () => {
  let sellerId: string;
  let orderId: string;

  beforeEach(async () => {
    // Clean and setup
    await prisma.approval.deleteMany();
    await prisma.proposedAction.deleteMany();
    await prisma.order.deleteMany();
    await prisma.seller.deleteMany();

    const seller = await prisma.seller.create({
      data: {
        paypalMerchantId: "MCH-TEST-EXEC",
        displayName: "Executor Test Store",
      },
    });
    sellerId = seller.id;

    const order = await prisma.order.create({
      data: {
        sellerId,
        paypalOrderId: "PP-ORD-TEST-99",
        amount: 150.0,
        buyerEmail: "buyer@example.com",
        shipToAddress: "123 Main St",
        transactionAddress: "123 Main St",
        trackingStatus: "NONE",
        refundedAmount: 0.0,
      },
    });
    orderId = order.id;
  });

  it("successfully approves and executes tracking upload action", async () => {
    const action = await prisma.proposedAction.create({
      data: {
        type: "upload_tracking",
        orderId,
        payloadJson: JSON.stringify({
          carrier: "USPS",
          suggestedTrackingNumber: "94001118995612345678",
        }),
        rationale: "Order missing tracking",
        priority: 1,
        status: "proposed",
      },
    });

    const result = await actionExecutor.approveAndExecute(action.id, "seller");
    expect(result.success).toBe(true);

    const updatedAction = await prisma.proposedAction.findUnique({
      where: { id: action.id },
      include: { approvals: true },
    });

    expect(updatedAction?.status).toBe("executed");
    expect(updatedAction?.approvals.length).toBe(1);
    expect(updatedAction?.approvals[0].decision).toBe("approved");

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    expect(updatedOrder?.trackingStatus).toBe("SHIPPED");
    expect(updatedOrder?.trackingNumber).toBe("94001118995612345678");
  });

  it("blocks duplicate execution of an already executed action (Idempotency)", async () => {
    const action = await prisma.proposedAction.create({
      data: {
        type: "upload_tracking",
        orderId,
        payloadJson: JSON.stringify({ carrier: "USPS" }),
        rationale: "Tracking upload",
        status: "proposed",
      },
    });

    const firstRun = await actionExecutor.approveAndExecute(action.id, "seller");
    expect(firstRun.success).toBe(true);

    // Second execution attempt must fail
    const secondRun = await actionExecutor.approveAndExecute(action.id, "seller");
    expect(secondRun.success).toBe(false);
    expect(secondRun.message).toContain("Guardrail blocked: Action has already been executed");
  });

  it("enforces refund cap guardrail (cannot refund more than order amount)", async () => {
    const action = await prisma.proposedAction.create({
      data: {
        type: "refund",
        orderId,
        payloadJson: JSON.stringify({
          amount: 500.0, // Exceeds $150 order balance
          reason: "Customer requested full refund",
        }),
        rationale: "Refund test",
        status: "proposed",
      },
    });

    const result = await actionExecutor.approveAndExecute(action.id, "seller");
    expect(result.success).toBe(false);
    expect(result.message).toContain("exceeds remaining order balance");

    const failedAction = await prisma.proposedAction.findUnique({
      where: { id: action.id },
    });
    expect(failedAction?.status).toBe("failed");
  });
});
