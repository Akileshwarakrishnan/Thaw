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
    <div className="sticky top-0 z-40 bg-white border-b border-[#d4d7dc] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Statsig-style Top Announcement Banner */}
      <div className="bg-[#347cec] text-white py-1.5 px-4 text-center text-xs font-medium tracking-tight flex items-center justify-center gap-2">
        <span className="font-semibold bg-white/20 rounded-full px-2 py-0.5 text-[11px]">
          PayPal AI Hackathon 2026
        </span>
        <span className="hidden sm:inline">
          Deterministic 6-Signal Hold Risk Proxy Engine & Approval-Gated Agent
        </span>
        <button
          onClick={onOpenE2EProof}
          className="underline decoration-white/60 hover:decoration-white font-bold inline-flex items-center gap-1 text-[11px] ml-1"
        >
          Verify Sandbox Proof <ExternalLink className="h-3 w-3 inline" />
        </button>
      </div>

      {/* Main Navbar */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-28 flex items-center shrink-0">
              <Image
                src="/thaw-logo.png"
                alt="THAW"
                width={120}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden md:block h-6 w-[1px] bg-[#d4d7dc]" />
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wide uppercase text-[#535963]">
                  Early-Warning & Cash-Flow Shield
                </span>
                <span className="rounded-full bg-[#e5f0ff] px-2 py-0.5 text-[10px] font-bold text-[#1b63d2] border border-[#accfff]">
                  for PayPal Sellers
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#535963]">
                <Store className="h-3 w-3 text-[#367eed]" />
                <span className="font-medium text-[#1f2328]">{storeName}</span>
              </div>
            </div>
          </div>

          {/* Scenario Switcher (Statsig-style Pill Segments) */}
          <div className="flex items-center gap-1 rounded-full bg-[#f6f6f6] p-1 border border-[#d4d7dc]">
            <span className="px-2.5 text-[11px] font-bold text-[#535963] uppercase tracking-wider hidden lg:inline">
              Store Scenario:
            </span>
            <button
              onClick={() => onSwitchScenario("healthy")}
              disabled={isSwitching}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                currentScenario === "healthy"
                  ? "bg-white text-emerald-800 border border-[#d4d7dc] shadow-sm font-bold"
                  : "text-[#535963] hover:text-[#1f2328]"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Healthy
            </button>
            <button
              onClick={() => onSwitchScenario("drifting")}
              disabled={isSwitching}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                currentScenario === "drifting"
                  ? "bg-white text-[#1f2328] border border-[#367eed] shadow-sm ring-1 ring-[#367eed] font-bold"
                  : "text-[#535963] hover:text-[#1f2328]"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Drifting (Target)
            </button>
            <button
              onClick={() => onSwitchScenario("post_spike")}
              disabled={isSwitching}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                currentScenario === "post_spike"
                  ? "bg-white text-rose-800 border border-[#d4d7dc] shadow-sm font-bold"
                  : "text-[#535963] hover:text-[#1f2328]"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-rose-600" />
              Post-Spike
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1.5 rounded-full border border-[#d4d7dc] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1f2328] hover:bg-[#f6f6f6] hover:border-[#367eed] transition-all shadow-sm"
              title="30-Second Guided Tour for Hackathon Judges"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#367eed]" />
              30s Tour
            </button>

            <button
              onClick={onOpenE2EProof}
              className="flex items-center gap-1.5 rounded-full border border-[#accfff] bg-[#e5f0ff] px-3.5 py-1.5 text-xs font-bold text-[#1b63d2] hover:bg-[#accfff]/40 transition-all shadow-sm"
              title="Execute Real 5-Step Sandbox Verification Cycle"
            >
              <Shield className="h-3.5 w-3.5 text-[#1b63d2]" />
              PayPal Proof
            </button>

            <button
              onClick={onSimulateWebhook}
              className="flex items-center gap-1.5 rounded-full border border-[#d4d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#535963] hover:text-[#1f2328] hover:bg-[#f6f6f6] transition-all"
              title="Simulate incoming PayPal webhook"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Webhook
            </button>

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-full border border-[#d4d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#535963] hover:text-[#1f2328] hover:bg-[#f6f6f6] transition-all"
              title="Pull transactions, disputes, and tracking status"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#535963] ${
                  isSyncing ? "animate-spin text-[#367eed]" : ""
                }`}
              />
              {isSyncing ? "Syncing..." : "Sync"}
            </button>

            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-1.5 rounded-full bg-[#1f2328] hover:bg-[#343941] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-colors"
              title="Configure PayPal Sandbox credentials"
            >
              <Sliders className="h-3.5 w-3.5 text-[#accfff]" />
              Credentials
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
