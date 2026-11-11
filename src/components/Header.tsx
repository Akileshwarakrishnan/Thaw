"use client";

import React from "react";
import Image from "next/image";
import {
  RefreshCw,
  Sliders,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Store,
  Sparkles,
  Shield,
  ExternalLink,
} from "lucide-react";

interface HeaderProps {
  currentScenario: string;
  storeName: string;
  onSwitchScenario: (scenario: "healthy" | "drifting" | "post_spike") => void;
  onSync: () => void;
  onSimulateWebhook: () => void;
  onOpenConnectModal: () => void;
  onOpenTour: () => void;
  onOpenE2EProof: () => void;
  isSyncing: boolean;
  isSwitching: boolean;
}

export function Header({
  currentScenario,
  storeName,
  onSwitchScenario,
  onSync,
  onSimulateWebhook,
  onOpenConnectModal,
  onOpenTour,
  onOpenE2EProof,
  isSyncing,
  isSwitching,
}: HeaderProps) {
  // Shorten store name for clean navbar fit
  const cleanStoreName = storeName
    ? storeName.replace(/\s*\(.*?\)\s*/g, "").trim()
    : "Merchant Store";

  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-[#d4d7dc] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Announcement Bar (Statsig electric blue) */}
      <div className="bg-[#347cec] text-white h-7 sm:h-8 px-4 flex items-center justify-center text-xs font-medium tracking-tight">
        <div className="flex items-center gap-2">
          <span className="font-bold bg-white/20 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
            Merchant Intelligence
          </span>
          <span className="hidden sm:inline text-white/95">
            Automated PayPal Hold Detection & Human Approval-Gated AI Remediation
          </span>
          <span className="text-white/40 hidden md:inline">|</span>
          <button
            onClick={onOpenE2EProof}
            className="underline decoration-white/60 hover:decoration-white font-bold inline-flex items-center gap-1 text-[11px] text-white transition-opacity"
          >
            Verify Sandbox Proof <ExternalLink className="h-3 w-3 inline opacity-80" />
          </button>
        </div>
      </div>

      {/* Main SaaS Navbar: Balanced, responsive, zero-clipping */}
      <header className="mx-auto max-w-7xl h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Compact Context */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center">
            <Image
              src="/thaw-logo.png"
              alt="THAW"
              width={76}
              height={32}
              className="h-7 sm:h-8 w-auto object-contain select-none"
              priority
            />
          </div>

          <div className="hidden sm:block h-5 w-[1px] bg-[#d4d7dc]" />

          <div className="hidden md:flex items-center gap-2">
            <span className="rounded-full bg-[#e5f0ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1b63d2] border border-[#accfff]">
              for PayPal Sellers
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#535963]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-medium text-[#1f2328] truncate max-w-[110px] lg:max-w-[160px]">
                {cleanStoreName}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Scenario Switcher (Sleek segmented pills) */}
        <div className="flex items-center gap-1 rounded-full bg-[#f6f6f6] p-1 border border-[#d4d7dc] shrink-0">
          <button
            onClick={() => onSwitchScenario("healthy")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
              currentScenario === "healthy"
                ? "bg-white text-emerald-800 border border-[#d4d7dc] shadow-xs font-bold"
                : "text-[#535963] hover:text-[#1f2328]"
            }`}
            title="Healthy Store (Score: 25/100, 0% reserve)"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Healthy</span>
          </button>
          <button
            onClick={() => onSwitchScenario("drifting")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
              currentScenario === "drifting"
                ? "bg-white text-[#1f2328] border border-[#367eed] shadow-xs ring-1 ring-[#367eed] font-bold"
                : "text-[#535963] hover:text-[#1f2328]"
            }`}
            title="Drifting Store (Target Demo Scenario, Score: 63/100, 10% rolling reserve)"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Drifting (Target)</span>
          </button>
          <button
            onClick={() => onSwitchScenario("post_spike")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all ${
              currentScenario === "post_spike"
                ? "bg-white text-rose-800 border border-[#d4d7dc] shadow-xs font-bold"
                : "text-[#535963] hover:text-[#1f2328]"
            }`}
            title="Post-Spike Store (Score: 88/100, 30% reserve hold)"
          >
            <Flame className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span className="hidden sm:inline">Post-Spike</span>
          </button>
        </div>

        {/* Right: Primary Action Utilities (Guaranteed single-row, no truncation) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenTour}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#d4d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2328] hover:bg-[#f6f6f6] hover:border-[#367eed] transition-all shadow-xs"
            title="Interactive Guided Product Tour"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#367eed] shrink-0" />
            <span>Product Tour</span>
          </button>

          <button
            onClick={onOpenE2EProof}
            className="flex items-center gap-1.5 rounded-full border border-[#accfff] bg-[#e5f0ff] px-3 py-1.5 text-xs font-bold text-[#1b63d2] hover:bg-[#accfff]/40 transition-all shadow-xs"
            title="Execute Real 5-Step Sandbox Verification Cycle"
          >
            <Shield className="h-3.5 w-3.5 text-[#1b63d2] shrink-0" />
            <span className="hidden md:inline">PayPal</span> Proof
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1 rounded-full border border-[#d4d7dc] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#535963] hover:text-[#1f2328] hover:bg-[#f6f6f6] transition-all"
            title="Pull transactions, disputes, and tracking status"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 shrink-0 ${
                isSyncing ? "animate-spin text-[#367eed]" : "text-[#535963]"
              }`}
            />
            <span className="hidden lg:inline">Sync</span>
          </button>

          <button
            onClick={onSimulateWebhook}
            className="hidden lg:flex items-center gap-1 rounded-full border border-[#d4d7dc] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#535963] hover:text-[#1f2328] hover:bg-[#f6f6f6] transition-all"
            title="Simulate incoming PayPal webhook"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="hidden xl:inline">Webhook</span>
          </button>

          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-1.5 rounded-full bg-[#1f2328] hover:bg-[#343941] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors shrink-0"
            title="Configure PayPal Sandbox credentials"
          >
            <Sliders className="h-3.5 w-3.5 text-[#accfff] shrink-0" />
            <span>Credentials</span>
          </button>
        </div>
      </header>
    </div>
  );
}
