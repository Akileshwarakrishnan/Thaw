import { NextRequest, NextResponse } from "next/server";
import { seedScenario, ScenarioType } from "../../../../../scripts/seed";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const scenario: ScenarioType = body.scenario || "drifting";

    if (!["healthy", "drifting", "post_spike"].includes(scenario)) {
      return NextResponse.json(
        { success: false, error: "Invalid scenario. Choose 'healthy', 'drifting', or 'post_spike'." },
        { status: 400 }
      );
    }

    const result = await seedScenario(scenario);

    return NextResponse.json({
      success: true,
      message: `Scenario switched to ${scenario.toUpperCase()}`,
      scenario,
      storeName: result.seller.displayName,
      score: result.riskResult.score,
      band: result.riskResult.band,
      cashFlow: result.riskResult.cashFlow,
      actionsProposed: result.actionsCount,
    });
  } catch (error: any) {
    console.error("POST /api/demo/scenario error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
