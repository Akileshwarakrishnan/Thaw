import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateRisk } from "@/lib/risk/engine";
import { aiService } from "@/lib/ai/service";

export async function GET() {
  try {
    let snapshot = await prisma.riskSnapshot.findFirst({
      orderBy: { computedAt: "desc" },
      include: {
        seller: true,
        explanation: true,
      },
    });

    // If no snapshot exists yet (e.g. fresh db), auto-compute
    if (!snapshot) {
      let seller = await prisma.seller.findFirst();
      if (!seller) {
        seller = await prisma.seller.create({
          data: {
            paypalMerchantId: "MCH-THAW-INIT",
            displayName: "Demo Merchant Account",
          },
        });
      }

      const orders = await prisma.order.findMany({
        where: { sellerId: seller.id },
      });
      const disputes = await prisma.dispute.findMany({
        where: { order: { sellerId: seller.id } },
      });

      const evalResult = evaluateRisk({ orders, disputes });

      snapshot = await prisma.riskSnapshot.create({
        data: {
          sellerId: seller.id,
          score: evalResult.score,
          band: evalResult.band,
          signalsJson: JSON.stringify(evalResult.signals),
          cashAvailable: evalResult.cashFlow.clearedBalance,
          cashAtRisk: evalResult.cashFlow.atRiskAmount,
          expectedReleaseDays: evalResult.cashFlow.expectedReleaseDays,
        },
        include: {
          seller: true,
          explanation: true,
        },
      });

      // Generate AI explanation
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
    }

    const signals = JSON.parse(snapshot.signalsJson || "{}");
    const topReasons = snapshot.explanation?.topReasonsJson
      ? JSON.parse(snapshot.explanation.topReasonsJson)
      : [];

    // Query recent snapshots for score history
    const recentSnapshots = await prisma.riskSnapshot.findMany({
      where: { sellerId: snapshot.sellerId },
      orderBy: { computedAt: "desc" },
      take: 4,
      select: { score: true },
    });
    const history = recentSnapshots.reverse().map((s) => s.score);

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        score: snapshot.score,
        band: snapshot.band,
        computedAt: snapshot.computedAt,
        history,
        cashFlow: {
          available: snapshot.cashAvailable,
          atRisk: snapshot.cashAtRisk,
          expectedReleaseDays: snapshot.expectedReleaseDays,
          releaseDescription:
            snapshot.band === "HIGH"
              ? "60-180 Days (Account Limitation / Max Reserve)"
              : snapshot.band === "MEDIUM"
              ? "14-21 Days (10% Rolling Reserve)"
              : "Immediate (No Active Holds)",
        },
        signals,
        explanation: {
          summary: snapshot.explanation?.text || "",
          topReasons,
          model: snapshot.explanation?.model || "thaw-ai",
        },
        seller: {
          id: snapshot.seller.id,
          displayName: snapshot.seller.displayName,
          merchantId: snapshot.seller.paypalMerchantId,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/risk error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
