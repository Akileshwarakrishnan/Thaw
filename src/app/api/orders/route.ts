import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (filter === "missing_tracking") {
      where.trackingStatus = "NONE";
    } else if (filter === "address_mismatch") {
      where.isAddressMismatch = true;
    } else if (filter === "refunded") {
      where.refundedAmount = { gt: 0 };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        disputes: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        paypalOrderId: o.paypalOrderId,
        captureId: o.captureId,
        amount: o.amount,
        currency: o.currency,
        createdAt: o.createdAt,
        buyerEmail: o.buyerEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Masked for privacy
        buyerName: o.buyerName,
        shipToAddress: o.shipToAddress,
        transactionAddress: o.transactionAddress,
        isAddressMismatch: o.isAddressMismatch,
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        trackingStatus: o.trackingStatus,
        sellerProtectionStatus: o.sellerProtectionStatus,
        refundedAmount: o.refundedAmount,
        hasDispute: o.disputes.length > 0,
        disputes: o.disputes,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
