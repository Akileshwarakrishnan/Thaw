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
} from "lucide-react";

interface HeaderProps {
  currentScenario: string;
  storeName: string;
  onSwitchScenario: (scenario: "healthy" | "drifting" | "post_spike") => void;
  onSync: () => void;
  onSimulateWebhook: () => void;
  onOpenConnectModal: () => void;
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
  isSyncing,
  isSwitching,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-600 to-indigo-700 shadow-lg shadow-brand-500/25">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Thaw
              </span>
              <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-300 border border-brand-500/20">
                built for PayPal sellers
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sandbox Live
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Store className="h-3 w-3 text-slate-400" />
              <span>{storeName || "Active Merchant Account"}</span>
            </div>
          </div>
        </div>

        {/* Demo Scenario Switcher (One-Click Testing for Judges) */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <span className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Demo Scenarios:
          </span>
          <button
            onClick={() => onSwitchScenario("healthy")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              currentScenario === "healthy"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Healthy
          </button>
          <button
            onClick={() => onSwitchScenario("drifting")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              currentScenario === "drifting"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Drifting
          </button>
          <button
            onClick={() => onSwitchScenario("post_spike")}
            disabled={isSwitching}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              currentScenario === "post_spike"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            Post-Spike
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateWebhook}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-brand-500/50 hover:bg-slate-800 transition-colors"
            title="Simulate incoming PayPal webhook"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Simulate Webhook
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-brand-500/50 hover:bg-slate-800 transition-colors"
            title="Pull transactions, disputes, and tracking status"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-brand-400 ${
                isSyncing ? "animate-spin" : ""
              }`}
            />
            {isSyncing ? "Syncing..." : "Sync PayPal"}
          </button>

          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-500 transition-colors"
            title="Configure PayPal Sandbox credentials"
          >
            <Sliders className="h-3.5 w-3.5" />
            Credentials
          </button>
        </div>
      </div>
    </header>
  );
}
