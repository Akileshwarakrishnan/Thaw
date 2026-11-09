"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";

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
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-purple-500/10 p-1.5 text-purple-400 border border-purple-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-white">
              AI Risk Diagnosis & Plain-Language Explanation
            </h3>
          </div>
          <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-300 border border-purple-500/20">
            {model}
          </span>
        </div>

        {/* Executive Summary */}
        <div className="mt-4 rounded-xl bg-slate-900/60 p-4 border border-slate-800/80">
          <p className="text-sm leading-relaxed text-slate-200 font-normal">
            {summary ||
              "Your account metrics are currently being evaluated against PayPal's automated underwriting risk rules."}
          </p>
        </div>

        {/* Top 3 Contributing Factors */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top Contributing Risk Factors (Ranked by Underwriting Weight):
          </h4>
          <div className="space-y-2.5">
            {topReasons && topReasons.length > 0 ? (
              topReasons.map((reason) => (
                <div
                  key={reason.rank}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-300">
                        {reason.rank}
                      </span>
                      {reason.title}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      -{reason.estimatedRiskReduction} pts potential drop
                    </span>
                  </div>
                  <p className="text-slate-300 leading-normal">
                    {reason.explanation}
                  </p>
                  <div className="text-[11px] text-brand-300 font-medium flex items-center gap-1 pt-0.5">
                    <span className="text-slate-400">Fix:</span> {reason.actionableAdvice}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                No acute risk factors detected. Account is in optimal standing.
              </p>
            )}
          </div>
        </div>
      </div>

      {onSelectActionTab && (
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Automated remediation steps available in Action Queue
          </span>
          <button
            onClick={onSelectActionTab}
            className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            Review Proposed Actions
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
