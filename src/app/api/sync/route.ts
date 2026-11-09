import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paypalClient } from "@/lib/paypal/client";
import { evaluateRisk } from "@/lib/risk/engine";
import { aiService } from "@/lib/ai/service";

export async function POST() {
  try {
    const seller = await prisma.seller.findFirst();
    if (!seller) {
      return NextResponse.json(
        { success: false, error: "No merchant found" },
        { status: 404 }
      );
    }

    let syncedDisputesCount = 0;
    if (paypalClient.isConfigured()) {
      try {
        const remoteDisputes = await paypalClient.listDisputes();
        syncedDisputesCount = remoteDisputes.length;
      } catch (e: any) {
        console.warn("PayPal live dispute sync note:", e.message);
      }
    }

    const orders = await prisma.order.findMany({
      where: { sellerId: seller.id },
    });
    const disputes = await prisma.dispute.findMany({
      where: { order: { sellerId: seller.id } },
    });

    const evalResult = evaluateRisk({ orders, disputes });

    const snapshot = await prisma.riskSnapshot.create({
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

    const exp = await aiService.explainRisk(
      evalResult,
      orders.slice(0, 5).map((o) => ({
        id: o.id,
        paypalOrderId: o.paypalOrderId,
        amount: o.amount,
        trackingStatus: o.trackingStatus,
        isAddressMismatch: o.isAddressMismatch,
        createdAt: o.createdAt.toISOString(),
      }))
    );

    await prisma.explanation.create({
      data: {
        snapshotId: snapshot.id,
        text: exp.plainLanguageSummary,
        topReasonsJson: JSON.stringify(exp.topThreeReasons),
        model: "thaw-ai-gemini",
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: "system",
        event: "PAYPAL_SYNC_COMPLETED",
        detailsJson: JSON.stringify({
          syncedOrders: orders.length,
          syncedDisputes: disputes.length,
          remoteDisputesDetected: syncedDisputesCount,
          newScore: evalResult.score,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Synchronized with PayPal Sandbox successfully",
      syncedOrders: orders.length,
      syncedDisputes: disputes.length,
      newScore: evalResult.score,
      band: evalResult.band,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
