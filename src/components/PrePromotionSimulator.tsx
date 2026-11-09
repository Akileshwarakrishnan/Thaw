"use client";

import React, { useState } from "react";
import { Zap, AlertTriangle, ArrowRight, ShieldCheck, Mail, Send } from "lucide-react";

interface PrePromotionSimulatorProps {
  currentWeeklyVolume: number;
  currentRiskScore: number;
}

export function PrePromotionSimulator({
  currentWeeklyVolume,
  currentRiskScore,
}: PrePromotionSimulatorProps) {
  const [multiplier, setMultiplier] = useState<number>(2.5);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const baseline = Math.max(currentWeeklyVolume, 1500);
  const projectedWeeklyVolume = baseline * multiplier;
  const projectedVolumeJump = projectedWeeklyVolume - baseline;

  // Volume spike impact: >2x adds ~15-20 pts; >3.5x adds ~25-30 pts
  const pointsAdded = Math.round(
    Math.min(Math.max((multiplier - 1.2) * 12, 0), 28)
  );
  const projectedScore = Math.min(currentRiskScore + pointsAdded, 100);

  // Projected hold exposure
  const projectedHoldExposure = projectedScore >= 67 ? projectedWeeklyVolume * 0.3 : projectedWeeklyVolume * 0.1;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-amber-500/10 p-1.5 text-amber-400 border border-amber-500/20">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Pre-Promotion Warning & Volume Spike Simulator
            </h3>
            <p className="text-[11px] text-slate-400">
              Test upcoming marketing spikes (e.g. Black Friday) to avoid automated velocity holds.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
          Proactive Protection
        </span>
      </div>

      {/* Interactive Spike Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Select Anticipated Sales Spike:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1.8, 2.5, 4.0].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`rounded-lg py-2 px-2 text-xs font-bold transition-all ${
                  multiplier === m
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {m}x {m === 1.8 ? "Sale" : m === 2.5 ? "Flash" : "Mega"}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            Simulating a <strong>{multiplier}x</strong> sudden increase in sales velocity over 72 hours.
          </p>
        </div>

        {/* Projected Impact Meters */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
          <span className="text-[11px] font-semibold uppercase text-slate-400 block">
            Projected Underwriting Impact
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-300">Projected 7d Sales:</span>
            <span className="text-sm font-bold text-white">
              ${projectedWeeklyVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-300">Risk Score Jump:</span>
            <span className="text-sm font-bold text-rose-400">
              +{pointsAdded} pts ({projectedScore}/100)
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/80">
            <span className="text-xs text-slate-300">Estimated Held Reserve:</span>
            <span className="text-sm font-bold text-amber-400">
              ${projectedHoldExposure.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Proactive Resolution Action */}
        <div className="rounded-xl border border-brand-500/30 bg-brand-950/20 p-3 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-brand-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
              Preemptive Defense Strategy
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Notify PayPal Underwriting 5 days prior with warehouse pickup proofs. PayPal will whitelist the velocity increase.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-2 text-center text-xs font-semibold text-emerald-300">
              ✓ Pre-Notification Dispatched to PayPal Underwriting!
            </div>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-1.5 px-3 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-sm"
            >
              <Send className="h-3 w-3" />
              Notify PayPal Underwriting
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
