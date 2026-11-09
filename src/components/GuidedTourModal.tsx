"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Play,
  Bot,
} from "lucide-react";

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunE2EProof: () => void;
  onSelectActionQueue: () => void;
}

export function GuidedTourModal({
  isOpen,
  onClose,
  onRunE2EProof,
  onSelectActionQueue,
}: GuidedTourModalProps) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-brand-500/40 bg-slate-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-500/20 p-2 text-brand-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Thaw: 30-Second Judge Walkthrough
              </h3>
              <p className="text-xs text-slate-400">
                How Thaw stops surprise PayPal cash freezes before they happen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          {[
            { num: 1, label: "1. The Risk Threat" },
            { num: 2, label: "2. AI Diagnosis" },
            { num: 3, label: "3. Agentic Fix" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`rounded-lg py-1.5 border transition-all ${
                step === s.num
                  ? "bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-500/20"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 min-h-[170px] flex flex-col justify-between">
          {step === 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                Step 1: Early-Warning Before PayPal Freezes Funds
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Notice the <strong>Hold Risk Gauge</strong> showing <strong>63/100 (Medium Risk)</strong>.
                Unlike PayPal (which gives zero warning before holding money), Thaw scores your account continuously across 6 documented trigger signals.
              </p>
              <div className="rounded bg-slate-950 p-2 border border-slate-800 text-[11px] text-slate-300">
                💰 <strong>Cash-Flow Shield:</strong> Identifies that <strong>$303.40 (10% of last 14d)</strong> is at risk of being locked in a 21-day rolling reserve.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Bot className="h-4 w-4" />
                Step 2: Plain-Language AI Explanation
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thaw’s AI agent evaluates the risk snapshot and pinpoints the exact issues in plain English:
              </p>
              <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                <li>14 physical orders older than 3 days missing carrier tracking.</li>
                <li>4 orders shipped to addresses differing from checkout (voiding protection).</li>
                <li>1 dispute with a 48-hour response countdown timer.</li>
              </ul>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="h-4 w-4" />
                Step 3: Approval-Gated PayPal Agent Toolkit Execution
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The AI proposes remediations, but <strong>zero money or data moves without your approval</strong>.
                When you click <strong>Approve & Execute</strong>:
              </p>
              <div className="rounded bg-emerald-950/20 border border-emerald-500/30 p-2 text-[11px] text-emerald-300">
                ✓ Executed through <strong>@paypal/agent-toolkit</strong> $\rightarrow$ Tracking is dispatched to PayPal $\rightarrow$ Risk Score drops $\rightarrow$ Held funds are released!
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400">Step {step} of 3</span>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-500 shadow flex items-center gap-1"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onSelectActionQueue();
                  }}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 shadow flex items-center gap-1"
                >
                  Try Approving an Action! <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Direct Sandbox E2E Trigger Button */}
        <div className="rounded-xl border border-brand-500/30 bg-brand-950/20 p-3 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            <strong className="text-white block">Want Real PayPal Proof?</strong>
            Run live 5-step test cycle against PayPal Sandbox (Order, Tracking, Refund, Disputes, Webhook).
          </div>
          <button
            onClick={() => {
              onClose();
              onRunE2EProof();
            }}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 shadow flex items-center gap-1.5 shrink-0"
          >
            <Play className="h-3.5 w-3.5" />
            Run E2E Proof
          </button>
        </div>
      </div>
    </div>
  );
}
