import { NextResponse } from "next/server";
import { runSandboxE2EProof } from "../../../../../scripts/sandbox-e2e";

export async function POST() {
  try {
    const report = await runSandboxE2EProof();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("POST /api/paypal/e2e-proof error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
