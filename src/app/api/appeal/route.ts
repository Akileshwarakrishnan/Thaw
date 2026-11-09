import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/service";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { disputeId, orderId, disputeReason, orderAmount, carrier, trackingNumber } = body;

    let targetReason = disputeReason || "MERCHANDISE_OR_SERVICE_NOT_RECEIVED";
    let targetAmount = orderAmount || 120.0;
    let targetCarrier = carrier || "USPS Priority Mail";
    let targetTracking = trackingNumber;

    if (disputeId) {
      const dispute = await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: { order: true },
      });
      if (dispute) {
        targetReason = dispute.reason;
        targetAmount = dispute.amount;
        if (dispute.order.trackingNumber) {
          targetTracking = dispute.order.trackingNumber;
          targetCarrier = dispute.order.carrier || "USPS";
        }
      }
    } else if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (order) {
        targetAmount = order.amount;
        if (order.trackingNumber) {
          targetTracking = order.trackingNumber;
          targetCarrier = order.carrier || "USPS";
        }
      }
    }

    const appeal = await aiService.draftDisputeAppeal({
      disputeReason: targetReason,
      orderAmount: targetAmount,
      carrier: targetCarrier,
      trackingNumber: targetTracking,
    });

    // Log the AI drafting action
    await prisma.auditLog.create({
      data: {
        actor: "ai",
        event: "APPEAL_DRAFTED",
        detailsJson: JSON.stringify({
          disputeReason: targetReason,
          subject: appeal.subject,
          confidenceRating: appeal.confidenceRating,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      appeal,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
