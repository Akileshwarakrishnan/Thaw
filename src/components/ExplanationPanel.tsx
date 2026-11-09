"use client";

import React from "react";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface Reason {
  rank: number;
  title: string;
  explanation: string;
  actionableAdvice: string;
  estimatedRiskReduction: number;
}

interface ExplanationPanelProps {
  summary: string;
  topReasons: Reason[];
  model?: string;
  onSelectActionTab?: () => void;
}

export function ExplanationPanel({
  summary,
  topReasons,
  model = "thaw-ai-gemini",
  onSelectActionTab,
}: ExplanationPanelProps) {
  return (
    <div className="bg-white rounded-[10px] p-6 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] hover:border-[#367eed] transition-all flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#e5f0ff] p-1.5 text-[#367eed]">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-[#1f2328]">
              AI Risk Diagnosis & Plain-Language Explanation
            </h3>
          </div>
          <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-xs font-semibold text-[#535963] border border-[#d4d7dc]">
            {model}
          </span>
        </div>

        {/* Executive Summary */}
        <div className="mt-4 rounded-[10px] bg-[#f6f6f6] p-4 border border-[#d4d7dc]">
          <p className="text-sm leading-relaxed text-[#1f2328] font-normal">
            {summary ||
              "Your store metrics are being continuously evaluated against PayPal's published Seller Protection policies and automated reserve thresholds."}
          </p>
        </div>

        {/* Top Contributing Factors */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#535963]">
            Top Contributing Risk Factors (Ranked by Underwriting Weight):
          </h4>
          <div className="space-y-3">
            {topReasons && topReasons.length > 0 ? (
              topReasons.map((reason) => (
                <div
                  key={reason.rank}
                  className="rounded-[10px] border border-[#d4d7dc] bg-white p-4 text-xs space-y-2 hover:border-[#367eed] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1f2328] text-sm flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e5f0ff] text-xs font-bold text-[#1b63d2]">
                        {reason.rank}
                      </span>
                      {reason.title}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                      -{reason.estimatedRiskReduction} pts potential drop
                    </span>
                  </div>
                  <p className="text-[#535963] leading-relaxed text-xs">
                    {reason.explanation}
                  </p>
                  <div className="text-xs text-[#1f2328] font-semibold flex items-center gap-1.5 pt-1 border-t border-[#f6f6f6]">
                    <span className="text-[#535963] font-normal">Recommended Fix:</span> {reason.actionableAdvice}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#535963] italic py-3">
                No acute risk factors detected. Account is in optimal standing.
              </p>
            )}
          </div>
        </div>
      </div>

      {onSelectActionTab && (
        <div className="mt-5 pt-3 border-t border-[#d4d7dc] flex items-center justify-between">
          <span className="text-xs text-[#535963]">
            Remediations are queued below and waiting for your approval
          </span>
          <button
            onClick={onSelectActionTab}
            className="flex items-center gap-1 text-xs font-bold text-[#367eed] hover:text-[#1b63d2] transition-colors"
          >
            View Action Queue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
