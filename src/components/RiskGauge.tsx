"use client";

import React from "react";
import { ShieldCheck, AlertCircle, AlertTriangle, Flame } from "lucide-react";
import { RiskBand } from "@/lib/risk/types";

interface RiskGaugeProps {
  score: number;
  band: RiskBand;
  evaluatedAt: string;
  history?: number[];
}

export function RiskGauge({ score, band, evaluatedAt, history }: RiskGaugeProps) {
  // SVG gauge calculations (semi-circle arc)
  const radius = 80;
  const circumference = Math.PI * radius; // 180 degrees arc
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const bandColors = {
    LOW: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      stroke: "#10b981",
      glow: "shadow-emerald-500/20",
      icon: ShieldCheck,
      label: "LOW RISK",
      description: "Low likelihood of hold or limitation. Clean fulfillment.",
    },
    MEDIUM: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      stroke: "#f59e0b",
      glow: "shadow-amber-500/20",
      icon: AlertTriangle,
      label: "MEDIUM RISK",
      description: "Elevated risk signals detected. Reserve holds possible.",
    },
    HIGH: {
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      stroke: "#f43f5e",
      glow: "shadow-rose-500/20",
      icon: Flame,
      label: "HIGH RISK",
      description: "Critical trigger threshold reached. PayPal freeze imminent.",
    },
  }[band];

  const IconComponent = bandColors.icon;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
      <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          Hold Risk Engine
        </span>
        <span className="text-[11px] text-slate-400">
          {evaluatedAt ? new Date(evaluatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
        </span>
      </div>

      {/* Circular SVG Gauge */}
      <div className="relative mt-4 flex items-center justify-center">
        <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
          {/* Background track arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Colored progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={bandColors.stroke}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score in center */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
            <span className={`text-4xl font-extrabold tracking-tight ${bandColors.text}`}>
              {score}
            </span>
            <span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
            Hold Score
          </span>
        </div>
      </div>

      {/* Band Badge */}
      <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${bandColors.bg} ${bandColors.text} ${bandColors.border} ${bandColors.glow} shadow-md`}
        >
          <IconComponent className="h-3.5 w-3.5" />
          <span>{bandColors.label}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed mt-1">
          {bandColors.description}
        </p>
      </div>

      {/* Score History Sparkline Trend */}
      {history && history.length > 1 && (
        <div className="w-full mt-3 rounded-lg bg-slate-900/60 p-2 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="font-semibold text-slate-300">History:</span>
          <div className="flex items-center gap-1 font-mono">
            {history.map((s, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-600">→</span>}
                <span
                  className={
                    idx === history.length - 1
                      ? `font-bold ${bandColors.text}`
                      : "text-slate-400"
                  }
                >
                  {s}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Bands Scale Legend */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 text-[11px] text-slate-400">
        <div>
          <span className="block font-semibold text-emerald-400">0 - 33</span>
          <span>Low</span>
        </div>
        <div>
          <span className="block font-semibold text-amber-400">34 - 66</span>
          <span>Medium</span>
        </div>
        <div>
          <span className="block font-semibold text-rose-400">67 - 100</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
