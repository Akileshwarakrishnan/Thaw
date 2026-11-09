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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#1c346c] flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#84bbe3]" />
          Cash-Flow Shield & Hold Forecast
        </h2>
        <span className="text-xs text-[#526699] font-medium hidden sm:inline">
          Proxy estimation based on PayPal underwriting reserve rules
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Now */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E6EE] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-[#526699] font-medium">
            <span>Cleared & Available Now</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#1c346c]">
              ${cashFlow.clearedBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Cleared
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#64759d]">
            Unrestricted funds ready for immediate bank withdrawal.
          </p>
        </div>

        {/* Estimated at Risk */}
        <div className={`rounded-2xl p-5 border shadow-sm transition-shadow ${
          band === "HIGH"
            ? "border-l-4 border-l-[#cc352c] border-red-200 bg-red-50/30"
            : band === "MEDIUM"
            ? "border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/30"
            : "border-l-4 border-l-emerald-500 border-emerald-200 bg-emerald-50/20"
        }`}>
          <div className="flex items-center justify-between text-xs text-[#526699] font-medium">
            <span>Estimated At Risk (Hold Reserve)</span>
            <ShieldAlert className={`h-4 w-4 ${
              band === "HIGH" ? "text-[#cc352c]" : band === "MEDIUM" ? "text-amber-600" : "text-emerald-600"
            }`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold tracking-tight ${
              band === "HIGH" ? "text-[#cc352c]" : band === "MEDIUM" ? "text-amber-800" : "text-emerald-800"
            }`}>
              ${cashFlow.atRiskAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#526699] font-medium">({atRiskPct}% of 14d)</span>
          </div>
          <p className="mt-1 text-[11px] text-[#64759d]">
            {band === "HIGH"
              ? "Critical exposure: PayPal automated algorithms freeze 30% on high defect risk."
              : band === "MEDIUM"
              ? "Medium exposure: PayPal standard 10% rolling reserve vulnerability."
              : "Zero funds at risk: Healthy fulfillment metrics maintain 0% reserve."}
          </p>
        </div>

        {/* Expected Release Timeline */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E6EE] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-[#526699] font-medium">
            <span>Expected Release Timeline</span>
            <Calendar className="h-4 w-4 text-[#84bbe3]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-[#1c346c]">
              {cashFlow.expectedReleaseDays === 0
                ? "Immediate"
                : `${cashFlow.expectedReleaseDays} Days`}
            </span>
            <span className="text-xs text-[#526699] font-medium">
              {cashFlow.expectedReleaseDays === 0 ? "No delay" : "Rolling window"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#64759d]">
            {cashFlow.expectedReleaseRange}
          </p>
        </div>

        {/* 14-Day Sales Velocity */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4E6EE] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-[#526699] font-medium">
            <span>Trailing 14-Day Sales Volume</span>
            <TrendingUp className="h-4 w-4 text-[#1c346c]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#1c346c]">
              ${cashFlow.trailing14dSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1c346c]">
              14d Gross
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#64759d]">
            Underwriting benchmark window used for hold calculations.
          </p>
        </div>
      </div>
    </div>
  );
}
