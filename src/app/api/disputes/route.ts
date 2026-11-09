import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { openedAt: "desc" },
      include: {
        order: true,
      },
    });

    return NextResponse.json({
      success: true,
      disputes: disputes.map((d) => ({
        id: d.id,
        paypalDisputeId: d.paypalDisputeId,
        reason: d.reason,
        status: d.status,
        amount: d.amount,
        currency: d.currency,
        openedAt: d.openedAt,
        responseDueAt: d.responseDueAt,
        buyerNotes: d.buyerNotes,
        order: {
          id: d.order.id,
          paypalOrderId: d.order.paypalOrderId,
          amount: d.order.amount,
          trackingNumber: d.order.trackingNumber,
          carrier: d.order.carrier,
          trackingStatus: d.order.trackingStatus,
          sellerProtectionStatus: d.order.sellerProtectionStatus,
        },
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
