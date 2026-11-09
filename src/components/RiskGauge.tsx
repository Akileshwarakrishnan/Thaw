"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Flame, TrendingDown, ArrowRight } from "lucide-react";
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
      label: "LOW RISK (SAFE)",
      description: "Low likelihood of hold or account limitation. Clean fulfillment.",
    },
    MEDIUM: {
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      stroke: "#f59e0b",
      icon: AlertTriangle,
      label: "MEDIUM RISK (DRIFTING)",
      description: "Elevated risk signals detected. PayPal standard 10% rolling reserve vulnerability.",
    },
    HIGH: {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      stroke: "#e11d48",
      icon: Flame,
      label: "HIGH RISK (HOLD IMMINENT)",
      description: "Critical trigger threshold reached. 30% freeze imminent unless remediated.",
    },
  }[band];

  const IconComponent = bandColors.icon;

  return (
    <div className="bg-white rounded-[10px] p-6 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] hover:border-[#367eed] transition-all flex flex-col items-center justify-between text-center relative h-full">
      <div className="w-full flex items-center justify-between text-xs text-[#535963] border-b border-[#d4d7dc] pb-3">
        <span className="font-bold uppercase tracking-wider text-[#1f2328]">
          Hold Risk Proxy Engine
        </span>
        <span className="text-xs text-[#535963]">
          {evaluatedAt ? new Date(evaluatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Real-time"}
        </span>
      </div>

      {/* Circular SVG Gauge */}
      <div className="relative mt-6 flex items-center justify-center">
        <svg className="w-52 h-32 overflow-visible" viewBox="0 0 200 110">
          {/* Background track arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ededed"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Colored progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={bandColors.stroke}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score in center */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-extrabold tracking-tighter ${bandColors.text}`}>
              {score}
            </span>
            <span className="text-base font-semibold text-[#535963]">/100</span>
          </div>
          <span className="text-xs font-bold text-[#535963] uppercase tracking-wider mt-1">
            Risk Score
          </span>
        </div>
      </div>

      {/* Band Badge & Short Description */}
      <div className="mt-4 w-full space-y-2">
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${bandColors.bg} ${bandColors.text} border ${bandColors.border}`}>
          <IconComponent className="h-3.5 w-3.5" />
          <span>{bandColors.label}</span>
        </div>
        <p className="text-xs text-[#535963] leading-relaxed max-w-xs mx-auto">
          {bandColors.description}
        </p>
      </div>

      {/* Score History Trend */}
      {history && history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#d4d7dc] w-full flex items-center justify-between text-xs text-[#535963]">
          <span className="font-semibold flex items-center gap-1 text-[#1f2328]">
            <TrendingDown className="h-3.5 w-3.5 text-[#367eed]" />
            Trajectory:
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {history.map((histScore, idx) => (
              <React.Fragment key={idx}>
                <span
                  className={`rounded-full px-2 py-0.5 font-bold ${
                    idx === history.length - 1
                      ? "bg-[#1f2328] text-white"
                      : "bg-[#f6f6f6] text-[#535963] border border-[#d4d7dc]"
                  }`}
                >
                  {histScore}
                </span>
                {idx < history.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-[#d4d7dc]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
