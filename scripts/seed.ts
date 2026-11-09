import { PrismaClient } from "@prisma/client";
import { evaluateRisk } from "../src/lib/risk/engine";
import { aiService } from "../src/lib/ai/service";

const prisma = new PrismaClient();

export type ScenarioType = "healthy" | "drifting" | "post_spike";

export async function seedScenario(scenario: ScenarioType = "drifting") {
  console.log(`\n🌱 Seeding store scenario: "${scenario.toUpperCase()}"...`);

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.proposedAction.deleteMany();
  await prisma.explanation.deleteMany();
  await prisma.riskSnapshot.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.order.deleteMany();
  await prisma.seller.deleteMany();

  const now = new Date();

  // Create Seller
  const seller = await prisma.seller.create({
    data: {
      paypalMerchantId: "MCH-THAW-SANDBOX-01",
      displayName:
        scenario === "healthy"
          ? "NovaCraft Goods (Healthy Store)"
          : scenario === "drifting"
          ? "ApexGear Apparel (Drifting Store)"
          : "LuminaTech Direct (Post-Spike Store)",
      connectedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      sandboxMode: true,
    },
  });

  const ordersData: Array<any> = [];
  const disputesData: Array<any> = [];

  const addresses = [
    "742 Evergreen Terrace, Springfield, OR 97477",
    "124 Conch Street, Bikini Bottom, FL 33040",
    "221B Baker Street, New York, NY 10001",
    "4 Privet Drive, Little Whinging, CA 90210",
    "350 5th Ave, New York, NY 10118",
    "100 Universal City Plaza, Universal City, CA 91608",
  ];

  if (scenario === "healthy") {
    // 40 orders over 45 days, steady volume, 100% tracking, 0 address mismatches, 1 resolved dispute
    for (let i = 1; i <= 40; i++) {
      const daysAgo = Math.floor((i / 40) * 35);
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const amount = Math.floor(45 + (i * 7) % 150) + 0.99;
      const addr = addresses[i % addresses.length];

      ordersData.push({
        sellerId: seller.id,
        paypalOrderId: `ORD-HLTH-${1000 + i}`,
        captureId: `CAP-HLTH-${2000 + i}`,
        amount,
        currency: "USD",
        createdAt: orderDate,
        buyerEmail: `buyer.${i}@example.com`,
        buyerName: `Buyer ${i}`,
        shipToAddress: addr,
        transactionAddress: addr,
        isAddressMismatch: false,
        shippedAt: new Date(orderDate.getTime() + 18 * 60 * 60 * 1000),
        trackingNumber: `940011189956${20000000 + i}`,
        carrier: "USPS",
        trackingStatus: "DELIVERED",
        sellerProtectionStatus: "ELIGIBLE",
        refundedAmount: 0.0,
      });
    }

    // 1 isolated resolved dispute
    disputesData.push({
      paypalDisputeId: "DISP-HLTH-001",
      orderIndex: 38,
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      amount: 54.99,
      openedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      responseDueAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      buyerNotes: "Package delayed by weather but received safely. Resolved.",
    });
  } else if (scenario === "drifting") {
    // 48 orders, 14 orders missing tracking (>3d old), 4 address mismatches, 2 open disputes
    for (let i = 1; i <= 48; i++) {
      const daysAgo = Math.floor((i / 48) * 32);
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const amount = Math.floor(60 + (i * 11) % 180) + 0.5;
      const shipAddr = addresses[i % addresses.length];
      const isMismatch = i % 11 === 0 || i === 14;
      const transAddr = isMismatch
        ? "Alternative P.O. Box 991, Austin, TX 78701"
        : shipAddr;

      // Make 14 orders older than 3 days untracked
      const isMissingTracking = i >= 10 && i <= 24;

      ordersData.push({
        sellerId: seller.id,
        paypalOrderId: `ORD-DRIFT-${1000 + i}`,
        captureId: `CAP-DRIFT-${2000 + i}`,
        amount,
        currency: "USD",
        createdAt: orderDate,
        buyerEmail: `customer.${i}@domain.com`,
        buyerName: `Customer ${i}`,
        shipToAddress: shipAddr,
        transactionAddress: transAddr,
        isAddressMismatch: isMismatch,
        shippedAt: isMissingTracking ? null : new Date(orderDate.getTime() + 24 * 60 * 60 * 1000),
        trackingNumber: isMissingTracking ? null : `940011189956${30000000 + i}`,
        carrier: isMissingTracking ? null : "USPS",
        trackingStatus: isMissingTracking ? "NONE" : "SHIPPED",
        sellerProtectionStatus: isMismatch ? "NOT_ELIGIBLE" : "ELIGIBLE",
        refundedAmount: i === 5 ? 89.0 : 0.0,
      });
    }

    // 2 disputes (1 open with urgent response due)
    disputesData.push({
      paypalDisputeId: "DISP-DRIFT-101",
      orderIndex: 12,
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "WAITING_FOR_SELLER",
      amount: 145.5,
      openedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      responseDueAt: new Date(now.getTime() + 28 * 60 * 60 * 1000), // Due in 28 hours!
      buyerNotes: "Ordered 10 days ago, no tracking provided by seller. Need immediate refund.",
    });

    disputesData.push({
      paypalDisputeId: "DISP-DRIFT-102",
      orderIndex: 20,
      reason: "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
      status: "OPEN",
      amount: 112.0,
      openedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      responseDueAt: new Date(now.getTime() + 60 * 60 * 60 * 1000),
      buyerNotes: "Item received with cosmetic damage on exterior casing.",
    });
  } else {
    // POST-SPIKE STORE:
    // Sales triple in 3 days ($12,000 in 3 days vs historical baseline of $2,000/wk)
    // 3 open disputes with tight deadlines, 16 late shipments (>3 days old without tracking), 6 address mismatches
    for (let i = 1; i <= 65; i++) {
      // 35 orders within the sudden 3-day promotional spike
      const isRecentSpike = i <= 35;
      const daysAgo = isRecentSpike
        ? Math.random() * 2.5 // last 60 hours
        : 3.5 + ((i - 35) / 30) * 24; // older orders (3.5 to 28 days ago)

      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const amount = isRecentSpike
        ? Math.floor(180 + (i * 23) % 320) + 0.99
        : Math.floor(65 + (i * 11) % 110) + 0.5;

      const shipAddr = addresses[i % addresses.length];
      const isMismatch = i % 6 === 0;
      const transAddr = isMismatch
        ? "Commercial Reshipper Suite #902, Miami, FL 33166"
        : shipAddr;

      // Unfulfilled / missing tracking on older orders (fulfillment backlog caused by the spike)
      const isUntracked = (!isRecentSpike && i <= 52) || isRecentSpike;

      ordersData.push({
        sellerId: seller.id,
        paypalOrderId: `ORD-SPIKE-${5000 + i}`,
        captureId: `CAP-SPIKE-${6000 + i}`,
        amount,
        currency: "USD",
        createdAt: orderDate,
        buyerEmail: `shopper.${i}@fastmail.com`,
        buyerName: `Shopper ${i}`,
        shipToAddress: shipAddr,
        transactionAddress: transAddr,
        isAddressMismatch: isMismatch,
        shippedAt: isUntracked ? null : new Date(orderDate.getTime() + 14 * 60 * 60 * 1000),
        trackingNumber: isUntracked ? null : `1Z99999999${40000000 + i}`,
        carrier: isUntracked ? null : "UPS",
        trackingStatus: isUntracked ? "NONE" : "SHIPPED",
        sellerProtectionStatus: isMismatch ? "NOT_ELIGIBLE" : "ELIGIBLE",
        refundedAmount: i % 12 === 0 ? amount : 0.0,
      });
    }

    // 3 open disputes with urgent deadlines
    disputesData.push({
      paypalDisputeId: "DISP-SPIKE-501",
      orderIndex: 38,
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "WAITING_FOR_SELLER",
      amount: 289.95,
      openedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      responseDueAt: new Date(now.getTime() + 18 * 60 * 60 * 1000), // Due in 18h!
      buyerNotes: "No tracking uploaded. Seller is not responding to emails.",
    });

    disputesData.push({
      paypalDisputeId: "DISP-SPIKE-502",
      orderIndex: 42,
      reason: "UNAUTHORISED",
      status: "OPEN",
      amount: 195.0,
      openedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      responseDueAt: new Date(now.getTime() + 32 * 60 * 60 * 1000),
      buyerNotes: "Unrecognized transaction from my PayPal balance.",
    });

    disputesData.push({
      paypalDisputeId: "DISP-SPIKE-503",
      orderIndex: 45,
      reason: "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
      status: "WAITING_FOR_SELLER",
      amount: 220.5,
      openedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      responseDueAt: new Date(now.getTime() + 12 * 60 * 60 * 1000), // Due in 12h!
      buyerNotes: "Wrong specification sent. Requested return or replacement.",
    });
  }

  // Insert orders
  console.log(`Inserting ${ordersData.length} simulated orders...`);
  const createdOrders: any[] = [];
  for (const o of ordersData) {
    const created = await prisma.order.create({ data: o });
    createdOrders.push(created);
  }

  // Insert disputes
  console.log(`Inserting ${disputesData.length} disputes...`);
  const createdDisputes: any[] = [];
  for (const d of disputesData) {
    const matchedOrder = createdOrders[d.orderIndex] || createdOrders[0];
    const created = await prisma.dispute.create({
      data: {
        paypalDisputeId: d.paypalDisputeId,
        orderId: matchedOrder.id,
        reason: d.reason,
        status: d.status,
        amount: d.amount,
        openedAt: d.openedAt,
        responseDueAt: d.responseDueAt,
        buyerNotes: d.buyerNotes,
      },
    });
    createdDisputes.push(created);
  }

  // Compute Risk Snapshot using deterministic engine
  console.log("Evaluating risk snapshot using documented trigger signals...");
  const riskResult = evaluateRisk({
    orders: createdOrders,
    disputes: createdDisputes,
    referenceDate: now,
  });

  console.log(
    `✅ Computed Score: ${riskResult.score}/100 (${riskResult.band} BAND)`
  );
  console.log(
    `   Cash-flow estimate: Available $${riskResult.cashFlow.clearedBalance.toLocaleString()}, At Risk $${riskResult.cashFlow.atRiskAmount.toLocaleString()}`
  );

  const snapshot = await prisma.riskSnapshot.create({
    data: {
      sellerId: seller.id,
      score: riskResult.score,
      band: riskResult.band,
      signalsJson: JSON.stringify(riskResult.signals),
      cashAvailable: riskResult.cashFlow.clearedBalance,
      cashAtRisk: riskResult.cashFlow.atRiskAmount,
      expectedReleaseDays: riskResult.cashFlow.expectedReleaseDays,
    },
  });

  // Generate AI Explanation
  console.log("Generating plain-language AI explanation and ranked actions...");
  const explanation = await aiService.explainRisk(
    riskResult,
    createdOrders.map((o) => ({
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
      text: explanation.plainLanguageSummary,
      topReasonsJson: JSON.stringify(explanation.topThreeReasons),
      model: "thaw-ai-gemini",
    },
  });

  // Propose Actions for Human Approval
  const proposed = await aiService.proposeActions(
    riskResult,
    createdOrders.map((o) => ({
      id: o.id,
      paypalOrderId: o.paypalOrderId,
      amount: o.amount,
      trackingStatus: o.trackingStatus,
      isAddressMismatch: o.isAddressMismatch,
      buyerEmail: o.buyerEmail,
    })),
    createdDisputes.map((d) => ({
      id: d.id,
      paypalDisputeId: d.paypalDisputeId,
      orderId: d.orderId,
      amount: d.amount,
      reason: d.reason,
      responseDueAt: d.responseDueAt.toISOString(),
    }))
  );

  for (const act of proposed) {
    await prisma.proposedAction.create({
      data: {
        title: act.title,
        type: act.type,
        orderId: act.type === "upload_tracking" || act.type === "refund" ? act.targetId : null,
        disputeId: act.type === "draft_reply" ? act.targetId : null,
        payloadJson: JSON.stringify(act.payload),
        rationale: act.rationale,
        priority: act.priority,
        expectedRiskDrop: act.expectedRiskDrop,
        status: "proposed",
      },
    });
  }

  // Log to Audit Log
  await prisma.auditLog.create({
    data: {
      actor: "system",
      event: "SCENARIO_SEEDED",
      detailsJson: JSON.stringify({
        scenario,
        storeName: seller.displayName,
        score: riskResult.score,
        band: riskResult.band,
        actionsProposed: proposed.length,
      }),
    },
  });

  console.log(`🎉 Successfully seeded "${scenario.toUpperCase()}" scenario!`);
  return { seller, snapshot, riskResult, actionsCount: proposed.length };
}

// When run directly from CLI
if (require.main === module) {
  const scenarioArg = (process.argv[2] as ScenarioType) || "drifting";
  seedScenario(scenarioArg)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
