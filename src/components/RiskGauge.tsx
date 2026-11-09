"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Flame } from "lucide-react";
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
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      stroke: "#10b981",
      icon: ShieldCheck,
      label: "LOW RISK",
      description: "Low likelihood of hold or limitation. Clean fulfillment.",
    },
    MEDIUM: {
      text: "text-amber-800",
      bg: "bg-amber-50",
      border: "border-amber-200",
      stroke: "#f59e0b",
      icon: AlertTriangle,
      label: "MEDIUM RISK",
      description: "Elevated risk signals detected. PayPal reserve holds possible.",
    },
    HIGH: {
      text: "text-[#cc352c]",
      bg: "bg-red-50",
      border: "border-red-200",
      stroke: "#cc352c",
      icon: Flame,
      label: "HIGH RISK",
      description: "Critical trigger threshold reached. PayPal freeze imminent.",
    },
  }[band];

  const IconComponent = bandColors.icon;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E4E6EE] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-between text-center relative">
      <div className="w-full flex items-center justify-between text-xs text-[#526699] border-b border-[#E4E6EE] pb-3">
        <span className="font-bold uppercase tracking-wider text-[#1c346c]">
          Hold Risk Engine
        </span>
        <span className="text-[11px] text-[#64759d]">
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
            stroke="#E4E6EE"
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
            <span className="text-sm font-semibold text-[#64759d]">/100</span>
          </div>
          <span className="text-[11px] font-bold text-[#526699] uppercase tracking-widest mt-0.5">
            Hold Score
          </span>
        </div>
      </div>

      {/* Band Badge */}
      <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider border shadow-sm ${bandColors.bg} ${bandColors.text} ${bandColors.border}`}
        >
          <IconComponent className="h-3.5 w-3.5" />
          <span>{bandColors.label}</span>
        </div>
        <p className="text-xs text-[#526699] max-w-[260px] leading-relaxed mt-1 font-medium">
          {bandColors.description}
        </p>
      </div>

      {/* Score History Sparkline Trend */}
      {history && history.length > 1 && (
        <div className="w-full mt-3 rounded-xl bg-[#F0F5F7] p-2 border border-[#E4E6EE] text-[11px] text-[#526699] flex items-center justify-between">
          <span className="font-bold text-[#1c346c]">History:</span>
          <div className="flex items-center gap-1.5 font-mono">
            {history.map((s, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400">→</span>}
                <span
                  className={
                    idx === history.length - 1
                      ? `font-bold ${bandColors.text}`
                      : "text-slate-500"
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
      <div className="w-full mt-4 pt-3 border-t border-[#E4E6EE] grid grid-cols-3 text-[11px] text-[#64759d]">
        <div>
          <span className="block font-bold text-emerald-700">0 - 33</span>
          <span>Low</span>
        </div>
        <div>
          <span className="block font-bold text-amber-700">34 - 66</span>
          <span>Medium</span>
        </div>
        <div>
          <span className="block font-bold text-[#cc352c]">67 - 100</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
