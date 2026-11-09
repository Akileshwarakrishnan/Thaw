"use client";

import React from "react";
import { DollarSign, ShieldAlert, Calendar, TrendingUp, Lock, CheckCircle2 } from "lucide-react";
import { CashFlowMetrics, RiskBand } from "@/lib/risk/types";

interface CashFlowShieldProps {
  cashFlow: CashFlowMetrics;
  band: RiskBand;
}

export function CashFlowShield({ cashFlow, band }: CashFlowShieldProps) {
  const atRiskPct = band === "HIGH" ? 30 : band === "MEDIUM" ? 10 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-brand-400" />
          Cash-Flow Shield & Hold Forecast
        </h2>
        <span className="text-[11px] text-slate-400">
          Proxy estimation based on PayPal underwriting reserve rules
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Now */}
        <div className="glass-panel glass-panel-hover rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cleared & Available Now</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${cashFlow.clearedBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Cleared</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Unrestricted funds ready for immediate bank withdrawal.
          </p>
        </div>

        {/* Estimated at Risk */}
        <div className={`glass-panel glass-panel-hover rounded-xl p-4 relative overflow-hidden border-l-4 ${
          band === "HIGH"
            ? "border-l-rose-500 bg-rose-950/20"
            : band === "MEDIUM"
            ? "border-l-amber-500 bg-amber-950/20"
            : "border-l-emerald-500 bg-emerald-950/10"
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated At Risk (Hold Reserve)</span>
            <ShieldAlert className={`h-4 w-4 ${
              band === "HIGH" ? "text-rose-400" : band === "MEDIUM" ? "text-amber-400" : "text-emerald-400"
            }`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${
              band === "HIGH" ? "text-rose-400" : band === "MEDIUM" ? "text-amber-400" : "text-emerald-400"
            }`}>
              ${cashFlow.atRiskAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400">({atRiskPct}% of 14d)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {band === "HIGH"
              ? "Critical exposure: PayPal automated algorithms freeze 30% on high defect risk."
              : band === "MEDIUM"
              ? "Medium exposure: PayPal standard 10% rolling reserve vulnerability."
              : "Zero funds at risk: Healthy fulfillment metrics maintain 0% reserve."}
          </p>
        </div>

        {/* Expected Release Timeline */}
        <div className="glass-panel glass-panel-hover rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Expected Release Timeline</span>
            <Calendar className="h-4 w-4 text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              {cashFlow.expectedReleaseDays === 0
                ? "Immediate"
                : `${cashFlow.expectedReleaseDays} Days`}
            </span>
            <span className="text-xs text-slate-400">
              {cashFlow.expectedReleaseDays === 0 ? "No delay" : "Rolling window"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {cashFlow.expectedReleaseRange}
          </p>
        </div>

        {/* 14-Day Sales Velocity */}
        <div className="glass-panel glass-panel-hover rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Trailing 14-Day Sales Volume</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${cashFlow.trailing14dSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-indigo-400 font-medium">14d Gross</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Underwriting benchmark window used for hold calculations.
          </p>
        </div>
      </div>
    </div>
  );
}
