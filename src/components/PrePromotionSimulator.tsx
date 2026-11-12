"use client";

import React, { useState } from "react";
import { Zap, AlertTriangle, ArrowRight, ShieldCheck, Mail, Send, CheckCircle2 } from "lucide-react";

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
    <div className="bg-white rounded-[10px] p-6 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4d7dc] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-amber-50 p-2 text-amber-600 border border-amber-200">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1f2328]">
              Pre-Promotion Warning & Volume Spike Simulator
            </h3>
            <p className="text-xs text-[#535963]">
              Simulate upcoming marketing spikes (e.g. Flash Sales, Black Friday) before automated velocity holds trigger.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-xs font-bold text-[#1f2328] border border-[#d4d7dc]">
          Proactive Risk Hedging
        </span>
      </div>

      {/* Interactive Spike Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#1f2328] block">
            Select Anticipated Sales Multiplier:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1.8, 2.5, 4.0].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`rounded-full py-2 px-2 text-xs font-bold transition-all ${
                  multiplier === m
                    ? "bg-[#1f2328] text-white shadow-sm"
                    : "bg-[#f6f6f6] text-[#535963] border border-[#d4d7dc] hover:border-[#367eed] hover:text-[#1f2328]"
                }`}
              >
                {m}x {m === 1.8 ? "Promo" : m === 2.5 ? "Flash" : "Mega"}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#535963]">
            Simulating a <strong className="text-[#1f2328]">{multiplier}x</strong> sudden increase in sales velocity over 72 hours.
          </p>
        </div>

        {/* Projected Impact Meters */}
        <div className="rounded-[10px] border border-[#d4d7dc] bg-[#f6f6f6] p-4 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#535963] block">
            Projected Underwriting Impact
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#535963]">Projected 7-Day Sales:</span>
            <span className="text-sm font-bold text-[#1f2328]">
              ${projectedWeeklyVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#535963]">Risk Score Shift:</span>
            <span className="text-sm font-bold text-rose-600">
              +{pointsAdded} pts ({projectedScore}/100)
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1.5 border-t border-[#d4d7dc]">
            <span className="text-xs text-[#535963]">Estimated Held Reserve:</span>
            <span className="text-sm font-bold text-amber-700">
              ${projectedHoldExposure.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Proactive Resolution Action */}
        <div className="rounded-[10px] border border-[#accfff] bg-[#e5f0ff]/50 p-4 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#1b63d2] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#367eed]" />
              Preemptive Defense Strategy
            </span>
            <p className="text-xs text-[#535963] leading-relaxed">
              Notify PayPal Underwriting 5 days prior with warehouse pickup proofs. PayPal will whitelist the velocity increase and waive automated rolling reserves.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-full bg-emerald-100 border border-emerald-300 p-2 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              Pre-Notification Dispatched to PayPal Underwriting
            </div>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#1f2328] py-2 px-4 text-xs font-bold text-white hover:bg-[#343941] transition-all shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Notify PayPal Underwriting
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
