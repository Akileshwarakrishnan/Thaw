import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const actions = await prisma.proposedAction.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      include: {
        order: true,
        dispute: true,
        approvals: true,
      },
    });

    return NextResponse.json({
      success: true,
      actions: actions.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title || a.type.replace(/_/g, " ").toUpperCase(),
        rationale: a.rationale,
        priority: a.priority,
        expectedRiskDrop: a.expectedRiskDrop,
        status: a.status,
        payload: JSON.parse(a.payloadJson || "{}"),
        createdAt: a.createdAt,
        order: a.order
          ? {
              id: a.order.id,
              paypalOrderId: a.order.paypalOrderId,
              amount: a.order.amount,
              trackingStatus: a.order.trackingStatus,
              isAddressMismatch: a.order.isAddressMismatch,
            }
          : null,
        dispute: a.dispute
          ? {
              id: a.dispute.id,
              paypalDisputeId: a.dispute.paypalDisputeId,
              reason: a.dispute.reason,
              amount: a.dispute.amount,
              status: a.dispute.status,
            }
          : null,
        approvals: a.approvals,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
