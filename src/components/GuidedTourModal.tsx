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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-[#E4E6EE] bg-white p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E6EE] pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#84bbe3]/20 p-2 text-[#1c346c]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c346c]">
                Thaw: 30-Second Judge Walkthrough
              </h3>
              <p className="text-xs text-[#526699]">
                How Thaw stops surprise PayPal cash freezes before they happen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64759d] hover:bg-[#F0F5F7] hover:text-[#1c346c]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          {[
            { num: 1, label: "1. The Risk Threat" },
            { num: 2, label: "2. AI Diagnosis" },
            { num: 3, label: "3. Agentic Fix" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`rounded-lg py-2 border transition-all ${
                step === s.num
                  ? "bg-[#1c346c] text-white border-[#1c346c] shadow-sm"
                  : "bg-[#F0F5F7] text-[#526699] border-[#E4E6EE] hover:text-[#1c346c]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-[#E4E6EE] bg-[#F0F5F7]/60 p-4 min-h-[170px] flex flex-col justify-between">
          {step === 1 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Step 1: Early-Warning Before PayPal Freezes Funds
              </div>
              <p className="text-xs text-[#1c346c] leading-relaxed">
                Notice the <strong>Hold Risk Gauge</strong> showing <strong>63/100 (Medium Risk)</strong>.
                Unlike PayPal (which gives zero advance warning before placing accounts in hold), Thaw scores your store continuously across 6 documented trigger signals.
              </p>
              <div className="rounded-lg bg-white p-2.5 border border-[#E4E6EE] text-xs text-[#1c346c]">
                💰 <strong>Cash-Flow Shield:</strong> Identifies that <strong>$303.40 (10% rolling reserve)</strong> is at risk of being frozen for 21 days.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Bot className="h-4 w-4 text-purple-700" />
                Step 2: Plain-Language AI Explanation
              </div>
              <p className="text-xs text-[#1c346c] leading-relaxed">
                Thaw’s AI agent evaluates the risk snapshot and pinpoints the exact issues in plain English:
              </p>
              <ul className="text-xs text-[#526699] space-y-1 list-disc list-inside">
                <li>14 physical orders older than 3 days missing carrier tracking.</li>
                <li>4 orders shipped to addresses differing from checkout (voiding protection).</li>
                <li>1 dispute with a 48-hour response countdown timer.</li>
              </ul>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Step 3: Approval-Gated PayPal Agent Toolkit Execution
              </div>
              <p className="text-xs text-[#1c346c] leading-relaxed">
                The AI agent drafts the required remediations, but <strong>zero money or data moves without your approval</strong>.
                When you click <strong>Approve & Execute</strong>:
              </p>
              <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-2.5 text-xs text-emerald-900 font-medium">
                ✓ Executed via <strong>@paypal/agent-toolkit</strong> $\rightarrow$ Tracking is dispatched to PayPal $\rightarrow$ Risk Score drops $\rightarrow$ Held funds are released!
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E4E6EE] mt-3">
            <span className="text-xs font-medium text-[#526699]">Step {step} of 3</span>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="rounded-lg border border-[#E4E6EE] px-3.5 py-1 text-xs font-bold text-[#526699] hover:bg-white"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="rounded-lg bg-[#1c346c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#152752] shadow flex items-center gap-1"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onSelectActionQueue();
                  }}
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 shadow flex items-center gap-1"
                >
                  Try Approving an Action! <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Direct Sandbox E2E Trigger Button */}
        <div className="rounded-xl border border-[#84bbe3] bg-[#84bbe3]/10 p-3.5 flex items-center justify-between gap-3">
          <div className="text-xs text-[#526699]">
            <strong className="text-[#1c346c] block font-bold">Want Real PayPal Proof?</strong>
            Run live 5-step test cycle against PayPal Sandbox (Order, Tracking, Refund, Disputes, Webhook).
          </div>
          <button
            onClick={() => {
              onClose();
              onRunE2EProof();
            }}
            className="rounded-lg bg-[#1c346c] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#152752] shadow flex items-center gap-1.5 shrink-0"
          >
            <Play className="h-3.5 w-3.5" />
            Run E2E Proof
          </button>
        </div>
      </div>
    </div>
  );
}
