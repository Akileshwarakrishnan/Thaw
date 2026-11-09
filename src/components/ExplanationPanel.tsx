"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

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
    <div className="bg-white rounded-2xl p-6 border border-[#E4E6EE] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E6EE] pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-100 p-1.5 text-purple-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-[#1c346c]">
              AI Risk Diagnosis & Plain-Language Explanation
            </h3>
          </div>
          <span className="rounded-full bg-purple-50 px-3 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
            {model}
          </span>
        </div>

        {/* Executive Summary */}
        <div className="mt-4 rounded-xl bg-[#F0F5F7] p-4 border border-[#E4E6EE]">
          <p className="text-sm leading-relaxed text-[#1c346c] font-normal">
            {summary ||
              "Your account metrics are currently being evaluated against PayPal's automated underwriting risk rules."}
          </p>
        </div>

        {/* Top 3 Contributing Factors */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#526699]">
            Top Contributing Risk Factors (Ranked by Underwriting Weight):
          </h4>
          <div className="space-y-2.5">
            {topReasons && topReasons.length > 0 ? (
              topReasons.map((reason) => (
                <div
                  key={reason.rank}
                  className="rounded-xl border border-[#E4E6EE] bg-white p-3.5 text-xs space-y-1.5 hover:border-[#84bbe3] transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1c346c] flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#84bbe3]/30 text-xs font-bold text-[#1c346c]">
                        {reason.rank}
                      </span>
                      {reason.title}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      -{reason.estimatedRiskReduction} pts potential drop
                    </span>
                  </div>
                  <p className="text-[#526699] leading-relaxed">
                    {reason.explanation}
                  </p>
                  <div className="text-[11px] text-[#1c346c] font-semibold flex items-center gap-1 pt-0.5">
                    <span className="text-[#64759d] font-medium">Recommended Fix:</span> {reason.actionableAdvice}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#64759d] italic py-2">
                No acute risk factors detected. Account is in optimal standing.
              </p>
            )}
          </div>
        </div>
      </div>

      {onSelectActionTab && (
        <div className="mt-5 pt-3 border-t border-[#E4E6EE] flex items-center justify-between">
          <span className="text-xs text-[#526699]">
            Remediation steps are queued and waiting for your approval
          </span>
          <button
            onClick={onSelectActionTab}
            className="flex items-center gap-1 text-xs font-bold text-[#1c346c] hover:text-[#84bbe3] transition-colors"
          >
            Review Proposed Actions
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
