import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paypalClient } from "@/lib/paypal/client";
import { evaluateRisk } from "@/lib/risk/engine";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventId = event.id || `MOCK-EVT-${Date.now()}`;
    const eventType = event.event_type || "UNKNOWN";

    // 1. Check idempotency: dedupe by eventId
    const existing = await prisma.webhookEvent.findUnique({
      where: { paypalEventId: eventId },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Event already processed (Idempotent response)",
        eventId,
      });
    }

    // 2. Signature verification
    const headers = request.headers;
    const transmissionId = headers.get("paypal-transmission-id") || "";
    const transmissionTime = headers.get("paypal-transmission-time") || "";
    const transmissionSig = headers.get("paypal-transmission-sig") || "";
    const certUrl = headers.get("paypal-cert-url") || "";
    const authAlgo = headers.get("paypal-auth-algo") || "";

    if (transmissionSig && !transmissionSig.startsWith("mock_")) {
      const isValid = await paypalClient.verifyWebhookSignature({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookEvent: event,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Webhook signature verification failed" },
          { status: 401 }
        );
      }
    }

    // 3. Store webhook event for idempotency
    await prisma.webhookEvent.create({
      data: {
        paypalEventId: eventId,
        eventType,
        payload: rawBody,
        status: "processed",
      },
    });

    // 4. Handle event types
    const resource = event.resource || {};
    const seller = await prisma.seller.findFirst();

    if (seller) {
      if (eventType.startsWith("CUSTOMER.DISPUTE.")) {
        const disputeId = resource.dispute_id || `DISP-${Date.now()}`;
        const reason = resource.reason || "MERCHANDISE_OR_SERVICE_NOT_RECEIVED";
        const status =
          eventType === "CUSTOMER.DISPUTE.RESOLVED"
            ? "RESOLVED"
            : resource.status || "WAITING_FOR_SELLER";
        const amount = parseFloat(resource.dispute_amount?.value || "85.00");

        // Find or associate an order
        let order = await prisma.order.findFirst({
          where: { sellerId: seller.id },
          orderBy: { createdAt: "desc" },
        });

        if (order) {
          await prisma.dispute.upsert({
            where: { paypalDisputeId: disputeId },
            update: { status, reason },
            create: {
              paypalDisputeId: disputeId,
              orderId: order.id,
              reason,
              status,
              amount,
              openedAt: new Date(),
              responseDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            },
          });
        }
      } else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
        const captureId = resource.id || resource.capture_id;
        if (captureId) {
          const matchedOrder = await prisma.order.findFirst({
            where: { captureId },
          });
          if (matchedOrder) {
            const refundVal = parseFloat(resource.amount?.value || "0");
            await prisma.order.update({
              where: { id: matchedOrder.id },
              data: {
                refundedAmount: (matchedOrder.refundedAmount || 0) + refundVal,
              },
            });
          }
        }
      }

      // Recompute risk score dynamically on webhook arrival
      const orders = await prisma.order.findMany({ where: { sellerId: seller.id } });
      const disputes = await prisma.dispute.findMany({ where: { order: { sellerId: seller.id } } });
      const evalResult = evaluateRisk({ orders, disputes });

      await prisma.riskSnapshot.create({
        data: {
          sellerId: seller.id,
          score: evalResult.score,
          band: evalResult.band,
          signalsJson: JSON.stringify(evalResult.signals),
          cashAvailable: evalResult.cashFlow.clearedBalance,
          cashAtRisk: evalResult.cashFlow.atRiskAmount,
          expectedReleaseDays: evalResult.cashFlow.expectedReleaseDays,
        },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actor: "system",
        event: "WEBHOOK_PROCESSED",
        detailsJson: JSON.stringify({
          eventId,
          eventType,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Webhook ${eventType} processed successfully`,
      eventId,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
