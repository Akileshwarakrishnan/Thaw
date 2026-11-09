import { NextRequest, NextResponse } from "next/server";
import { actionExecutor } from "@/lib/actions/executor";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actionId = params.id;
    if (!actionId) {
      return NextResponse.json(
        { success: false, error: "Action ID required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const approvedBy = body.approvedBy || "seller";

    const result = await actionExecutor.approveAndExecute(actionId, approvedBy);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
