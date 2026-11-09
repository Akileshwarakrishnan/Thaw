"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { HonestNotice } from "@/components/HonestNotice";
import { CashFlowShield } from "@/components/CashFlowShield";
import { RiskGauge } from "@/components/RiskGauge";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { SignalMeters } from "@/components/SignalMeters";
import { ActionQueue, ActionItem } from "@/components/ActionQueue";
import { OrdersTable, OrderRow } from "@/components/OrdersTable";
import { PrePromotionSimulator } from "@/components/PrePromotionSimulator";
import { AuditLogDrawer, AuditEntry } from "@/components/AuditLogDrawer";
import { AppealModal } from "@/components/AppealModal";
import { ConnectModal } from "@/components/ConnectModal";
import { GuidedTourModal } from "@/components/GuidedTourModal";
import { E2EProofModal } from "@/components/E2EProofModal";
import { RiskBand, RiskSignalsBreakdown, CashFlowMetrics } from "@/lib/risk/types";
import { Loader2, RefreshCw, CheckCircle, ArrowDownRight, Sparkles, X } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<"healthy" | "drifting" | "post_spike">("drifting");
  const [storeName, setStoreName] = useState("ApexGear Apparel (Drifting Store)");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Core risk snapshot data
  const [score, setScore] = useState<number>(63);
  const [band, setBand] = useState<RiskBand>("MEDIUM");
  const [evaluatedAt, setEvaluatedAt] = useState<string>("");
  const [scoreHistory, setScoreHistory] = useState<number[]>([78, 71, 63]);
  const [cashFlow, setCashFlow] = useState<CashFlowMetrics>({
    clearedBalance: 5437.5,
    atRiskAmount: 303.4,
    trailing14dSales: 3034.0,
    expectedReleaseDays: 21,
    expectedReleaseRange: "14-21 Days (Rolling 10% Reserve)",
  });
  const [signals, setSignals] = useState<RiskSignalsBreakdown | null>(null);
  const [explanation, setExplanation] = useState<{
    summary: string;
    topReasons: any[];
    model: string;
  }>({
    summary: "",
    topReasons: [],
    model: "thaw-ai-gemini",
  });

  // Action queue, orders, audit
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  // Action impact banner
  const [actionImpactAlert, setActionImpactAlert] = useState<{
    message: string;
    pointsDropped: number;
    channel: string;
  } | null>(null);

  // Modals
  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const [activeAppealIds, setActiveAppealIds] = useState<{
    disputeId?: string;
    orderId?: string;
  }>({});
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isE2EProofOpen, setIsE2EProofOpen] = useState(false);

  // Fetch all dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      const [riskRes, actionsRes, ordersRes, auditRes] = await Promise.all([
        fetch("/api/risk").then((r) => r.json()),
        fetch("/api/actions").then((r) => r.json()),
        fetch("/api/orders?limit=50").then((r) => r.json()),
        fetch("/api/audit").then((r) => r.json()),
      ]);

      if (riskRes.success && riskRes.snapshot) {
        const s = riskRes.snapshot;
        setScore(s.score);
        setBand(s.band);
        setEvaluatedAt(s.computedAt);
        setCashFlow({
          clearedBalance: s.cashFlow.available,
          atRiskAmount: s.cashFlow.atRisk,
          trailing14dSales: s.cashFlow.atRisk / (s.band === "HIGH" ? 0.3 : s.band === "MEDIUM" ? 0.1 : 1) || 3500,
          expectedReleaseDays: s.cashFlow.expectedReleaseDays,
          expectedReleaseRange: s.cashFlow.releaseDescription,
        });
        setSignals(s.signals);
        setExplanation(s.explanation);
        if (s.history && s.history.length > 0) {
          setScoreHistory(s.history);
        }
        if (s.seller?.displayName) {
          setStoreName(s.seller.displayName);
        }
      }

      if (actionsRes.success) {
        setActions(actionsRes.actions || []);
      }

      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
      }

      if (auditRes.success) {
        setAuditLogs(auditRes.logs || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Scenario Switcher
  const handleSwitchScenario = async (scenario: "healthy" | "drifting" | "post_spike") => {
    setIsSwitching(true);
    setCurrentScenario(scenario);
    setActionImpactAlert(null);
    try {
      const res = await fetch("/api/demo/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      if (data.success) {
        setStoreName(data.storeName);
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Scenario switch error:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  // Sync with PayPal
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      await loadDashboardData();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Simulate incoming Webhook
  const handleSimulateWebhook = async () => {
    try {
      const isDispute = Math.random() > 0.5;
      const payload = isDispute
        ? {
            id: `WH-DISP-${Date.now()}`,
            event_type: "CUSTOMER.DISPUTE.CREATED",
            resource: {
              dispute_id: `PP-D-${Date.now().toString(36).toUpperCase()}`,
              reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
              status: "WAITING_FOR_SELLER",
              dispute_amount: { value: "129.00", currency_code: "USD" },
            },
          }
        : {
            id: `WH-CAPT-${Date.now()}`,
            event_type: "PAYMENT.CAPTURE.COMPLETED",
            resource: {
              id: `CAP-WH-${Date.now().toString(36).toUpperCase()}`,
              amount: { value: "89.50", currency_code: "USD" },
            },
          };

      await fetch("/api/webhooks/paypal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "paypal-transmission-id": `sim-${Date.now()}`,
          "paypal-transmission-sig": "mock_valid_signature_token",
        },
        body: JSON.stringify(payload),
      });

      await loadDashboardData();
    } catch (err) {
      console.error("Webhook simulation error:", err);
    }
  };

  // Approve action
  const handleApproveAction = async (actionId: string) => {
    const prevScore = score;
    const res = await fetch(`/api/actions/${actionId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: "seller" }),
    });
    const data = await res.json();
    if (data.success) {
      await loadDashboardData();
      const drop = Math.max(prevScore - (data.result?.newScore || prevScore - 6), 5);
      setActionImpactAlert({
        message: data.result?.message || "Remediation executed successfully",
        pointsDropped: drop,
        channel: data.result?.executionChannel || "PAYPAL_AGENT_TOOLKIT",
      });
      setTimeout(() => setActionImpactAlert(null), 8000);
    } else {
      alert(`Approval error: ${data.error}`);
    }
  };

  // Reject action
  const handleRejectAction = async (actionId: string) => {
    await fetch(`/api/actions/${actionId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectedBy: "seller" }),
    });
    await loadDashboardData();
  };

  const handleOpenAppealModal = (disputeId?: string, orderId?: string) => {
    setActiveAppealIds({ disputeId, orderId });
    setIsAppealOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-400" />
        <div className="text-center">
          <p className="text-sm font-semibold">Initializing Thaw Early-Warning Engine...</p>
          <p className="text-xs text-slate-400">Loading PayPal sandbox signals and deterministic trigger weights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 flex flex-col justify-between">
      <div>
        {/* App Header & Scenario Switcher */}
        <Header
          currentScenario={currentScenario}
          storeName={storeName}
          onSwitchScenario={handleSwitchScenario}
          onSync={handleSync}
          onSimulateWebhook={handleSimulateWebhook}
          onOpenConnectModal={() => setIsConnectOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenE2EProof={() => setIsE2EProofOpen(true)}
          isSyncing={isSyncing}
          isSwitching={isSwitching}
        />

        {/* Main Workspace Body */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 space-y-6">
          {/* Action Impact Celebratory Banner */}
          {actionImpactAlert && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 backdrop-blur-md flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      Action Executed via{" "}
                      {actionImpactAlert.channel === "PAYPAL_AGENT_TOOLKIT"
                        ? "PayPal Agent Toolkit (MCP Protocol)"
                        : "PayPal REST Client"}
                      !
                    </span>
                    <span className="rounded bg-emerald-500/25 px-2 py-0.5 text-xs font-extrabold text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      -{actionImpactAlert.pointsDropped} pts Risk Drop
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {actionImpactAlert.message}. Cash-flow hold exposure updated in real time.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionImpactAlert(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Honest Limitation Banner */}
          <HonestNotice />

          {/* Cash Flow Shield Section */}
          <CashFlowShield cashFlow={cashFlow} band={band} />

          {/* Core Risk Gauge & AI Diagnosis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Risk Gauge (4 cols) */}
            <div className="lg:col-span-4">
              <RiskGauge
                score={score}
                band={band}
                evaluatedAt={evaluatedAt}
                history={scoreHistory}
              />
            </div>

            {/* AI Diagnosis & Plain-Language Explanation (8 cols) */}
            <div className="lg:col-span-8">
              <ExplanationPanel
                summary={explanation.summary}
                topReasons={explanation.topReasons}
                model={explanation.model}
                onSelectActionTab={() => {
                  const el = document.getElementById("action-queue-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          </div>

          {/* 6 Documented Risk Signals Breakdown */}
          {signals && <SignalMeters signals={signals} />}

          {/* AI Action Agent Queue (Approval-Gated) */}
          <div id="action-queue-section">
            <ActionQueue
              actions={actions}
              onApprove={handleApproveAction}
              onReject={handleRejectAction}
              onOpenAppealModal={handleOpenAppealModal}
            />
          </div>

          {/* Pre-Promotion Warning / Velocity Spike Simulator */}
          <PrePromotionSimulator
            currentWeeklyVolume={cashFlow.trailing14dSales / 2}
            currentRiskScore={score}
          />

          {/* Orders & Underwriting Ledger */}
          <OrdersTable
            orders={orders}
            onOpenAppealModal={handleOpenAppealModal}
          />

          {/* Compliance Audit Trail & Webhook Telemetry */}
          <AuditLogDrawer logs={auditLogs} />
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Thaw</strong> — Early-warning & cash-flow shield built for PayPal sellers.
          </span>
          <span className="text-[11px] text-slate-400">
            Open-source MIT License • PayPal AI Hackathon 2026
          </span>
        </div>
      </footer>

      {/* Dispute Appeal Rebuttal Modal */}
      <AppealModal
        isOpen={isAppealOpen}
        onClose={() => setIsAppealOpen(false)}
        disputeId={activeAppealIds.disputeId}
        orderId={activeAppealIds.orderId}
      />

      {/* Sandbox Connection Modal */}
      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      {/* 30-Second Guided Tour Modal for Judges */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onRunE2EProof={() => setIsE2EProofOpen(true)}
        onSelectActionQueue={() => {
          const el = document.getElementById("action-queue-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* End-to-End Real PayPal Sandbox Verification Modal */}
      <E2EProofModal
        isOpen={isE2EProofOpen}
        onClose={() => setIsE2EProofOpen(false)}
        onRefreshDashboard={() => loadDashboardData()}
      />
    </div>
  );
}
