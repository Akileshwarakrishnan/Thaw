import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

    // Update or generate explanation
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

    const createdExp = await prisma.explanation.create({
      data: {
        snapshotId: snapshot.id,
        text: exp.plainLanguageSummary,
        topReasonsJson: JSON.stringify(exp.topThreeReasons),
        model: "thaw-ai-gemini",
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actor: "seller",
        event: "SCORE_RECOMPUTED_MANUALLY",
        detailsJson: JSON.stringify({
          score: evalResult.score,
          band: evalResult.band,
          cashAtRisk: evalResult.cashFlow.atRiskAmount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        score: snapshot.score,
        band: snapshot.band,
        cashFlow: evalResult.cashFlow,
        signals: evalResult.signals,
        explanation: {
          summary: createdExp.text,
          topReasons: exp.topThreeReasons,
        },
      },
    });
  } catch (error: any) {
    console.error("POST /api/risk/recompute error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
