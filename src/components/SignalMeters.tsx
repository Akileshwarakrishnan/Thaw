"use client";

import React from "react";
import { SlidersHorizontal, AlertCircle, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { RiskSignalsBreakdown } from "@/lib/risk/types";

interface SignalMetersProps {
  signals: RiskSignalsBreakdown;
}

export function SignalMeters({ signals }: SignalMetersProps) {
  if (!signals || Object.keys(signals).length === 0) return null;

  const signalItems = [
    { key: "disputeRate", data: signals.disputeRate },
    { key: "missingTracking", data: signals.missingTracking },
    { key: "volumeSpike", data: signals.volumeSpike },
    { key: "addressMismatch", data: signals.addressMismatch },
    { key: "refundRate", data: signals.refundRate },
    { key: "disputeDeadlines", data: signals.disputeDeadlines },
  ];

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-400" />
          <h3 className="text-base font-semibold text-white">
            Deterministic Signal Breakdown & Trigger Weights
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          6 Publicly Documented Underwriting Triggers (Sum = 100 pts)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signalItems.map(({ key, data }) => {
          if (!data) return null;

          const statusColor =
            data.status === "CRITICAL"
              ? {
                  badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
                  bar: "bg-rose-500",
                }
              : data.status === "ELEVATED"
              ? {
                  badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                  bar: "bg-amber-500",
                }
              : {
                  badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                  bar: "bg-emerald-500",
                };

          const pct = Math.min(Math.round((data.contribution / data.weight) * 100), 100);

          return (
            <div
              key={key}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    {data.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Weight: {data.weight} pts max
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${statusColor.badge}`}
                >
                  {data.status}
                </span>
              </div>

              {/* Metric & Points */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-bold text-white">
                    {data.displayValue}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    Raw Metric
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-200">
                    +{data.contribution.toFixed(1)}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    pts added
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Safe</span>
                  <span>{pct}% Contribution</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] leading-relaxed text-slate-300 pt-1 border-t border-slate-800/60">
                {data.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
