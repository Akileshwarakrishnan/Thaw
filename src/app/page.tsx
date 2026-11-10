"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import { UnderwritingProfile } from "@/lib/risk/engine";
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  ArrowDownRight,
  Sparkles,
  X,
  Shield,
  SlidersHorizontal,
  Package,
  Zap,
  History,
  LayoutGrid,
  Play,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<"healthy" | "drifting" | "post_spike">("drifting");
  const [storeName, setStoreName] = useState("ApexGear Apparel (Drifting Store)");
  const [underwritingProfile, setUnderwritingProfile] = useState<UnderwritingProfile>("STANDARD_RETAIL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [activeTab, setActiveTab] = useState<"shield" | "signals" | "orders" | "simulator" | "audit" | "all">("shield");

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
        message: data.result?.message || "Remediation dispatched to PayPal successfully",
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

  const handleProfileChange = async (profile: UnderwritingProfile) => {
    setUnderwritingProfile(profile);
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/risk?profile=${profile}`).then((r) => r.json());
      if (res.success && res.snapshot) {
        setScore(res.snapshot.score);
        setBand(res.snapshot.band);
        setSignals(res.snapshot.signals);
        if (res.snapshot.cashFlow) {
          setCashFlow({
            clearedBalance: res.snapshot.cashFlow.available,
            atRiskAmount: res.snapshot.cashFlow.atRisk,
            trailing14dSales:
              res.snapshot.cashFlow.atRisk /
                (res.snapshot.band === "HIGH" ? 0.3 : res.snapshot.band === "MEDIUM" ? 0.1 : 1) || 3500,
            expectedReleaseDays: res.snapshot.cashFlow.expectedReleaseDays,
            expectedReleaseRange: res.snapshot.cashFlow.releaseDescription,
          });
        }
        if (res.snapshot.explanation) {
          setExplanation({
            summary: res.snapshot.explanation.summary,
            topReasons: res.snapshot.explanation.topReasons,
            model: res.snapshot.explanation.model,
          });
        }
      }
    } catch (err) {
      console.error("Failed to switch underwriting profile:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenAppealModal = (disputeId?: string, orderId?: string) => {
    setActiveAppealIds({ disputeId, orderId });
    setIsAppealOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#f6f6f6] text-[#1f2328] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#367eed]" />
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-[#1f2328]">Initializing Thaw Early-Warning Engine...</p>
          <p className="text-xs text-[#535963]">Evaluating PayPal sandbox telemetry and deterministic trigger weights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 flex flex-col justify-between bg-[#f6f6f6]">
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

        {/* Statsig-style Hero Section */}
        <section className="bg-white border-b border-[#d4d7dc] py-12 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl text-center space-y-5">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1f2328] leading-[1.1]">
              Detect hold risk before PayPal acts.<br />
              <span className="text-[#367eed]">Shield your merchant cash flow.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#535963] leading-relaxed">
              Thaw continuously monitors 6 documented underwriting triggers — missing tracking, dispute spikes, and address mismatches — proposing human-approval gated AI remediations before funds freeze.
            </p>

            {/* Statsig-style Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleSwitchScenario("drifting");
                  setActiveTab("shield");
                }}
                className="rounded-full bg-[#1f2328] hover:bg-[#343941] text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all"
              >
                Test Drifting Store Demo (63/100)
              </button>
              <button
                onClick={() => setIsTourOpen(true)}
                className="rounded-full bg-white hover:bg-[#f6f6f6] text-[#1f2328] border border-[#d4d7dc] px-6 py-3 text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-[#367eed]" />
                30-Second Guided Tour
              </button>
              <button
                onClick={() => setIsE2EProofOpen(true)}
                className="rounded-full bg-[#e5f0ff] hover:bg-[#accfff]/50 text-[#1b63d2] border border-[#accfff] px-5 py-3 text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Play className="h-4 w-4 text-[#1b63d2]" />
                Run Live PayPal Proof
              </button>
            </div>
          </div>
        </section>

        {/* Main Workspace Body */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8">
          {/* Action Impact Celebratory Banner */}
          {actionImpactAlert && (
            <div className="rounded-[10px] border border-emerald-300 bg-emerald-50 p-4 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-800">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-emerald-950 text-sm">
                      Action Executed via{" "}
                      {actionImpactAlert.channel === "PAYPAL_AGENT_TOOLKIT"
                        ? "PayPal Agent Toolkit (MCP Protocol)"
                        : "PayPal REST Client"}
                      !
                    </span>
                    <span className="rounded-full bg-emerald-200 px-3 py-0.5 text-xs font-extrabold text-emerald-900 border border-emerald-300 flex items-center gap-0.5">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      -{actionImpactAlert.pointsDropped} pts Risk Drop
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {actionImpactAlert.message}. Cash-flow hold reserve exposure updated in real time.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionImpactAlert(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Honest Limitation Banner */}
          <HonestNotice />

          {/* Cash Flow Shield Section (Elevated Statsig-style Metrics Strip) */}
          <CashFlowShield cashFlow={cashFlow} band={band} />

          {/* Clean Statsig Tab Navigation Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4d7dc] pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab("shield")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  activeTab === "shield"
                    ? "bg-[#1f2328] text-white shadow-sm"
                    : "bg-white text-[#535963] border border-[#d4d7dc] hover:text-[#1f2328]"
                }`}
              >
                <Shield className="h-4 w-4" />
                1. Risk & Action Shield (Main Demo)
              </button>

              <button
                onClick={() => setActiveTab("signals")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  activeTab === "signals"
                    ? "bg-[#1f2328] text-white shadow-sm"
                    : "bg-white text-[#535963] border border-[#d4d7dc] hover:text-[#1f2328]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                2. 6 Documented Signals & Evidence
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  activeTab === "orders"
                    ? "bg-[#1f2328] text-white shadow-sm"
                    : "bg-white text-[#535963] border border-[#d4d7dc] hover:text-[#1f2328]"
                }`}
              >
                <Package className="h-4 w-4" />
                3. Orders Ledger & Telemetry
              </button>

              <button
                onClick={() => setActiveTab("simulator")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  activeTab === "simulator"
                    ? "bg-[#1f2328] text-white shadow-sm"
                    : "bg-white text-[#535963] border border-[#d4d7dc] hover:text-[#1f2328]"
                }`}
              >
                <Zap className="h-4 w-4" />
                4. Pre-Spike Simulator
              </button>

              <button
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  activeTab === "audit"
                    ? "bg-[#1f2328] text-white shadow-sm"
                    : "bg-white text-[#535963] border border-[#d4d7dc] hover:text-[#1f2328]"
                }`}
              >
                <History className="h-4 w-4" />
                5. Audit Trail
              </button>
            </div>

            {/* Full Dashboard View Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === "all" ? "shield" : "all")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all shrink-0 ${
                activeTab === "all"
                  ? "bg-[#e5f0ff] text-[#1b63d2] border-[#accfff]"
                  : "bg-white text-[#535963] border border-[#d4d7dc] hover:text-[#1f2328]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {activeTab === "all" ? "Switch to Tabbed View" : "View All Sections (Full)"}
            </button>
          </div>

          {/* TAB 1: Main Core Demo (Risk, AI Diagnosis, Action Queue) */}
          {(activeTab === "shield" || activeTab === "all") && (
            <div className="space-y-6">
              {/* Core Risk Gauge & AI Diagnosis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Visual Risk Gauge (5 cols) */}
                <div className="lg:col-span-5">
                  <RiskGauge
                    score={score}
                    band={band}
                    evaluatedAt={evaluatedAt}
                    history={scoreHistory}
                  />
                </div>

                {/* AI Diagnosis & Plain-Language Explanation (7 cols) */}
                <div className="lg:col-span-7">
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

              {/* AI Action Agent Queue (Approval-Gated) */}
              <div id="action-queue-section">
                <ActionQueue
                  actions={actions}
                  onApprove={handleApproveAction}
                  onReject={handleRejectAction}
                  onOpenAppealModal={handleOpenAppealModal}
                />
              </div>
            </div>
          )}

          {/* TAB 2: 6 Documented Risk Signals Breakdown */}
          {(activeTab === "signals" || activeTab === "all") && signals && (
            <div className="space-y-6">
              <SignalMeters
                signals={signals}
                activeProfile={underwritingProfile}
                onProfileChange={handleProfileChange}
              />
            </div>
          )}

          {/* TAB 3: Orders & Underwriting Ledger */}
          {(activeTab === "orders" || activeTab === "all") && (
            <div className="space-y-6">
              <OrdersTable
                orders={orders}
                onOpenAppealModal={handleOpenAppealModal}
              />
            </div>
          )}

          {/* TAB 4: Pre-Promotion Warning / Velocity Spike Simulator */}
          {(activeTab === "simulator" || activeTab === "all") && (
            <div className="space-y-6">
              <PrePromotionSimulator
                currentWeeklyVolume={cashFlow.trailing14dSales / 2}
                currentRiskScore={score}
              />
            </div>
          )}

          {/* TAB 5: Compliance Audit Trail & Webhook Telemetry */}
          {(activeTab === "audit" || activeTab === "all") && (
            <div className="space-y-6">
              <AuditLogDrawer logs={auditLogs} />
            </div>
          )}
        </main>
      </div>

      {/* Statsig Clean Footer */}
      <footer className="mt-20 border-t border-[#d4d7dc] bg-white py-8 text-center text-xs text-[#535963]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/thaw-logo.png"
              alt="THAW"
              width={70}
              height={30}
              className="h-6 w-auto object-contain"
            />
            <span className="text-[#1f2328] font-semibold">
              — Early-warning & cash-flow shield built for PayPal sellers.
            </span>
          </div>
          <span className="text-xs text-[#535963]">
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
          setActiveTab("shield");
          setTimeout(() => {
            const el = document.getElementById("action-queue-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 100);
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
