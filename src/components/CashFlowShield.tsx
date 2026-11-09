"use client";

import React from "react";
import { DollarSign, ShieldAlert, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { CashFlowMetrics, RiskBand } from "@/lib/risk/types";

interface CashFlowShieldProps {
  cashFlow: CashFlowMetrics;
  band: RiskBand;
}

export function CashFlowShield({ cashFlow, band }: CashFlowShieldProps) {
  const atRiskPct = band === "HIGH" ? 30 : band === "MEDIUM" ? 10 : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1f2328] flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#367eed]" />
            Cash-Flow Shield & Hold Reserve Forecast
          </h2>
          <p className="text-xs text-[#535963]">
            Continuous balance assessment based on PayPal underwriting reserve rules.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#1b63d2] bg-[#e5f0ff] border border-[#accfff] rounded-full px-3 py-1 self-start sm:self-auto">
          {band === "HIGH" ? "Critical Exposure" : band === "MEDIUM" ? "10% Rolling Reserve Alert" : "Zero Hold Exposure"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Now */}
        <div className="bg-white rounded-[10px] p-5 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] hover:border-[#367eed] transition-all">
          <div className="flex items-center justify-between text-xs text-[#535963] font-semibold">
            <span>Cleared & Available Now</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1f2328]">
              ${cashFlow.clearedBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              Active
            </span>
          </div>
          <p className="mt-2 text-xs text-[#535963] leading-relaxed">
            Unrestricted funds ready for immediate bank withdrawal or supplier payout.
          </p>
        </div>

        {/* Estimated at Risk */}
        <div className={`bg-white rounded-[10px] p-5 border shadow-[0_0_20px_rgba(27,37,40,0.04)] transition-all ${
          band === "HIGH"
            ? "border-l-4 border-l-rose-600 border-[#d4d7dc]"
            : band === "MEDIUM"
            ? "border-l-4 border-l-amber-500 border-[#d4d7dc]"
            : "border-l-4 border-l-emerald-500 border-[#d4d7dc]"
        }`}>
          <div className="flex items-center justify-between text-xs text-[#535963] font-semibold">
            <span>Estimated At-Risk Reserve</span>
            <ShieldAlert className={`h-4 w-4 ${
              band === "HIGH" ? "text-rose-600" : band === "MEDIUM" ? "text-amber-500" : "text-emerald-600"
            }`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${
              band === "HIGH" ? "text-rose-600" : band === "MEDIUM" ? "text-amber-700" : "text-emerald-700"
            }`}>
              ${cashFlow.atRiskAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#535963] font-semibold">({atRiskPct}% of 14d)</span>
          </div>
          <p className="mt-2 text-xs text-[#535963] leading-relaxed">
            {band === "HIGH"
              ? "Critical exposure: PayPal automated algorithms freeze 30% on high defect risk."
              : band === "MEDIUM"
              ? "Medium exposure: PayPal standard 10% rolling reserve vulnerability."
              : "Zero funds at risk: Healthy fulfillment metrics maintain 0% reserve."}
          </p>
        </div>

        {/* Expected Release Timeline */}
        <div className="bg-white rounded-[10px] p-5 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] hover:border-[#367eed] transition-all">
          <div className="flex items-center justify-between text-xs text-[#535963] font-semibold">
            <span>Expected Release Horizon</span>
            <Calendar className="h-4 w-4 text-[#367eed]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1f2328]">
              {cashFlow.expectedReleaseDays === 0
                ? "Immediate"
                : `${cashFlow.expectedReleaseDays} Days`}
            </span>
            <span className="text-xs text-[#535963] font-semibold">
              {cashFlow.expectedReleaseDays === 0 ? "No delay" : "Rolling window"}
            </span>
          </div>
          <p className="mt-2 text-xs text-[#535963] leading-relaxed">
            {cashFlow.expectedReleaseRange}
          </p>
        </div>

        {/* 14-Day Sales Velocity */}
        <div className="bg-white rounded-[10px] p-5 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] hover:border-[#367eed] transition-all">
          <div className="flex items-center justify-between text-xs text-[#535963] font-semibold">
            <span>14-Day Captured Sales</span>
            <TrendingUp className="h-4 w-4 text-[#367eed]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1f2328]">
              ${cashFlow.trailing14dSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="rounded-full bg-[#f6f6f6] border border-[#d4d7dc] px-2 py-0.5 text-[10px] font-bold text-[#535963]">
              Baseline
            </span>
          </div>
          <p className="mt-2 text-xs text-[#535963] leading-relaxed">
            Gross run-rate used by PayPal automated underwriting to scale rolling hold sizes.
          </p>
        </div>
      </div>
    </div>
  );
}
