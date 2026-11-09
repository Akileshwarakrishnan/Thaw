"use client";

import React, { useState } from "react";
import {
  Shield,
  RefreshCw,
  Sliders,
  Send,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Store,
  Sparkles,
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
    <header className="border-b border-[#E4E6EE] bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#84bbe3] via-[#1c346c] to-[#0c1836] shadow-sm text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#1c346c]">
                Thaw
              </span>
              <span className="rounded-full bg-[#84bbe3]/20 px-2.5 py-0.5 text-xs font-semibold text-[#1c346c] border border-[#84bbe3]/40">
                built for PayPal sellers
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sandbox Live
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#526699]">
              <Store className="h-3 w-3 text-[#1c346c]" />
              <span className="font-medium">{storeName || "Active Merchant Account"}</span>
            </div>
          </div>
        </div>

        {/* Demo Scenario Switcher (One-Click Testing for Judges) */}
        <div className="flex items-center gap-1 rounded-xl bg-[#F0F5F7] p-1 border border-[#E4E6EE]">
          <span className="px-2 text-[11px] font-bold text-[#526699] uppercase tracking-wider">
            Demo Store:
          </span>
          <button
            onClick={() => onSwitchScenario("healthy")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              currentScenario === "healthy"
                ? "bg-white text-emerald-800 border border-emerald-300 shadow-sm"
                : "text-[#526699] hover:text-[#1c346c] hover:bg-white/60"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Healthy
          </button>
          <button
            onClick={() => onSwitchScenario("drifting")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              currentScenario === "drifting"
                ? "bg-white text-amber-800 border border-amber-300 shadow-sm ring-1 ring-amber-300"
                : "text-[#526699] hover:text-[#1c346c] hover:bg-white/60"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Drifting (Target)
          </button>
          <button
            onClick={() => onSwitchScenario("post_spike")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              currentScenario === "post_spike"
                ? "bg-white text-rose-800 border border-rose-300 shadow-sm"
                : "text-[#526699] hover:text-[#1c346c] hover:bg-white/60"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            Post-Spike
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors shadow-sm"
            title="Open 30-Second Guided Tour for Judges"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            30s Tour
          </button>

          <button
            onClick={onOpenE2EProof}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
            title="Execute Real 5-Step Sandbox Verification Cycle"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            PayPal Proof
          </button>

          <button
            onClick={onSimulateWebhook}
            className="flex items-center gap-1.5 rounded-lg border border-[#E4E6EE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c346c] hover:bg-slate-50 transition-colors shadow-sm"
            title="Simulate incoming PayPal webhook"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Webhook
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-[#E4E6EE] bg-white px-3 py-1.5 text-xs font-medium text-[#1c346c] hover:bg-slate-50 transition-colors shadow-sm"
            title="Pull transactions, disputes, and tracking status"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#1c346c] ${
                isSyncing ? "animate-spin" : ""
              }`}
            />
            {isSyncing ? "Syncing..." : "Sync PayPal"}
          </button>

          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#1c346c] hover:bg-[#162a56] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors"
            title="Configure PayPal Sandbox credentials"
          >
            <Sliders className="h-3.5 w-3.5 text-[#84bbe3]" />
            Credentials
          </button>
        </div>
      </div>
    </header>
  );
}
