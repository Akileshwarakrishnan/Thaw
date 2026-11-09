import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const snapshot = await prisma.riskSnapshot.findFirst({
      orderBy: { computedAt: "desc" },
      include: {
        explanation: true,
      },
    });

    if (!snapshot || !snapshot.explanation) {
      return NextResponse.json(
        { success: false, error: "No explanation found" },
        { status: 404 }
      );
    }

    const topReasons = snapshot.explanation.topReasonsJson
      ? JSON.parse(snapshot.explanation.topReasonsJson)
      : [];

    return NextResponse.json({
      success: true,
      explanation: {
        summary: snapshot.explanation.text,
        topReasons,
        model: snapshot.explanation.model,
        createdAt: snapshot.explanation.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
