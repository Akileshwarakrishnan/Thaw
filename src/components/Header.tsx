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
  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-[#d4d7dc] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Announcement Bar (Statsig electric blue) */}
      <div className="bg-[#347cec] text-white h-8 px-4 flex items-center justify-center text-xs font-medium tracking-tight">
        <div className="flex items-center gap-2">
          <span className="font-bold bg-white/20 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider">
            PayPal AI Hackathon 2026
          </span>
          <span className="hidden sm:inline text-white/90">
            Deterministic 6-Signal Hold Risk Proxy Engine & Approval-Gated Agent
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

      {/* Main SaaS Navbar (Single cohesive row, perfectly aligned) */}
      <header className="mx-auto max-w-7xl h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Context */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo with tight cropped aspect ratio: 356x150 -> 72px wide, 30px high */}
          <div className="flex items-center">
            <Image
              src="/thaw-logo.png"
              alt="THAW"
              width={76}
              height={32}
              className="h-8 w-auto object-contain select-none"
              priority
            />
          </div>

          <div className="hidden md:block h-5 w-[1px] bg-[#d4d7dc]" />

          <div className="hidden lg:flex items-center gap-2">
            <span className="rounded-full bg-[#e5f0ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1b63d2] border border-[#accfff]">
              for PayPal Sellers
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#535963]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[#1f2328] truncate max-w-[140px] xl:max-w-none">
                {storeName || "Active Merchant Store"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Scenario Switcher (Sleek segmented control) */}
        <div className="flex items-center gap-1 rounded-full bg-[#f6f6f6] p-1 border border-[#d4d7dc] shrink-0">
          <span className="pl-2 pr-1 text-[10px] font-extrabold text-[#535963] uppercase tracking-wider hidden xl:inline">
            Scenario:
          </span>
          <button
            onClick={() => onSwitchScenario("healthy")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              currentScenario === "healthy"
                ? "bg-white text-emerald-800 border border-[#d4d7dc] shadow-xs font-bold"
                : "text-[#535963] hover:text-[#1f2328]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Healthy</span>
          </button>
          <button
            onClick={() => onSwitchScenario("drifting")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              currentScenario === "drifting"
                ? "bg-white text-[#1f2328] border border-[#367eed] shadow-xs ring-1 ring-[#367eed] font-bold"
                : "text-[#535963] hover:text-[#1f2328]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Drifting (Target)</span>
          </button>
          <button
            onClick={() => onSwitchScenario("post_spike")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              currentScenario === "post_spike"
                ? "bg-white text-rose-800 border border-[#d4d7dc] shadow-xs font-bold"
                : "text-[#535963] hover:text-[#1f2328]"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            <span className="hidden sm:inline">Post-Spike</span>
          </button>
        </div>

        {/* Right: Primary Action Utilities (All on single row) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTour}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#d4d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2328] hover:bg-[#f6f6f6] hover:border-[#367eed] transition-all shadow-xs"
            title="30-Second Guided Tour for Hackathon Judges"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#367eed]" />
            30s Tour
          </button>

          <button
            onClick={onOpenE2EProof}
            className="flex items-center gap-1.5 rounded-full border border-[#accfff] bg-[#e5f0ff] px-3.5 py-1.5 text-xs font-bold text-[#1b63d2] hover:bg-[#accfff]/40 transition-all shadow-xs"
            title="Execute Real 5-Step Sandbox Verification Cycle"
          >
            <Shield className="h-3.5 w-3.5 text-[#1b63d2]" />
            <span className="hidden sm:inline">PayPal</span> Proof
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1 rounded-full border border-[#d4d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#535963] hover:text-[#1f2328] hover:bg-[#f6f6f6] transition-all"
            title="Pull transactions, disputes, and tracking status"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isSyncing ? "animate-spin text-[#367eed]" : "text-[#535963]"
              }`}
            />
            <span className="hidden md:inline">Sync</span>
          </button>

          <button
            onClick={onSimulateWebhook}
            className="hidden xl:flex items-center gap-1 rounded-full border border-[#d4d7dc] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#535963] hover:text-[#1f2328] hover:bg-[#f6f6f6] transition-all"
            title="Simulate incoming PayPal webhook"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Webhook
          </button>

          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-1.5 rounded-full bg-[#1f2328] hover:bg-[#343941] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
            title="Configure PayPal Sandbox credentials"
          >
            <Sliders className="h-3.5 w-3.5 text-[#accfff]" />
            <span className="hidden sm:inline">Credentials</span>
          </button>
        </div>
      </header>
    </div>
  );
}
