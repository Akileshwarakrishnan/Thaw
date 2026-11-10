import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateRisk, UNDERWRITING_PROFILES, UnderwritingProfile } from "@/lib/risk/engine";
import { aiService } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileParam = searchParams.get("profile") as UnderwritingProfile | null;

    let seller = await prisma.seller.findFirst();
    if (!seller) {
      seller = await prisma.seller.create({
        data: {
          paypalMerchantId: "MCH-THAW-INIT",
          displayName: "Demo Merchant Account",
        },
      });
    }

    // Dynamic profile evaluation if requested
    if (profileParam && ["STANDARD_RETAIL", "DROPSHIPPING", "DIGITAL_SAAS"].includes(profileParam)) {
      const orders = await prisma.order.findMany({
        where: { sellerId: seller.id },
      });
      const disputes = await prisma.dispute.findMany({
        where: { order: { sellerId: seller.id } },
      });

      const evalResult = evaluateRisk({ orders, disputes, profile: profileParam });
      const recentSnapshots = await prisma.riskSnapshot.findMany({
        where: { sellerId: seller.id },
        orderBy: { computedAt: "desc" },
        take: 4,
        select: { score: true },
      });
      const history = recentSnapshots.reverse().map((s) => s.score);
      if (history.length === 0) history.push(evalResult.score);
      else history[history.length - 1] = evalResult.score;

      const profileConfig = UNDERWRITING_PROFILES[profileParam];

      return NextResponse.json({
        success: true,
        profile: profileParam,
        profileConfig,
        snapshot: {
          id: `profile-${profileParam.toLowerCase()}`,
          score: evalResult.score,
          band: evalResult.band,
          computedAt: new Date().toISOString(),
          history,
          cashFlow: {
            available: evalResult.cashFlow.clearedBalance,
            atRisk: evalResult.cashFlow.atRiskAmount,
            expectedReleaseDays: evalResult.cashFlow.expectedReleaseDays,
            releaseDescription: evalResult.cashFlow.expectedReleaseRange,
          },
          signals: evalResult.signals,
          topFactors: evalResult.topFactors,
          explanation: {
            summary: `Risk re-computed under the ${profileConfig.name} profile (${evalResult.score}/100, ${evalResult.band} band). ${profileConfig.description}`,
            topReasons: evalResult.topFactors.slice(0, 3).map((f, i) => ({
              rank: i + 1,
              title: f.name,
              explanation: f.impactDescription,
              actionableAdvice: `Address ${f.name} to optimize ${profileConfig.name} compliance.`,
              estimatedRiskReduction: Math.round(f.contribution),
            })),
            model: "thaw-deterministic-profile-engine",
          },
          seller: {
            id: seller.id,
            displayName: seller.displayName,
            merchantId: seller.paypalMerchantId,
          },
        },
      });
    }

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
