"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  FileCheck,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";

interface AppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId?: string;
  orderId?: string;
}

export function AppealModal({
  isOpen,
  onClose,
  disputeId,
  orderId,
}: AppealModalProps) {
  const [loading, setLoading] = useState(false);
  const [appealData, setAppealData] = useState<{
    subject: string;
    appealBody: string;
    evidenceList: string[];
    sellerPolicyExcerpt: string;
    confidenceRating: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateAppeal();
    }
  }, [isOpen, disputeId, orderId]);

  const generateAppeal = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch("/api/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disputeId, orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setAppealData(data.appeal);
      }
    } catch (err) {
      console.error("Failed to generate appeal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!appealData) return;
    navigator.clipboard.writeText(
      `${appealData.subject}\n\n${appealData.appealBody}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                AI Dispute Appeal & Rebuttal Drafter
              </h3>
              <p className="text-xs text-slate-400">
                Crafted to satisfy PayPal Underwriting & Claims Review specifications.
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

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" />
            <p className="text-xs text-slate-300 font-medium">
              Analyzing dispute allegations, carrier tracking telemetry, and Seller Protection eligibility...
            </p>
          </div>
        ) : appealData ? (
          <div className="space-y-4 text-xs">
            {/* Confidence & Policy Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-purple-950/20 border border-purple-500/30 p-3">
              <div className="flex items-center gap-2 text-purple-300 font-semibold">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <span>Confidence: {appealData.confidenceRating}</span>
              </div>
              <span className="text-[11px] text-slate-300">
                Matches Seller Protection Criteria
              </span>
            </div>

            {/* Evidence Checklist */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
                Evidence Attached by AI:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {appealData.evidenceList.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-1.5 text-slate-300 text-[11px]"
                  >
                    <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">
                Subject Line
              </label>
              <input
                type="text"
                readOnly
                value={appealData.subject}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white font-medium"
              />
            </div>

            {/* Appeal Body */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase">
                Official Rebuttal Body
              </label>
              <textarea
                rows={10}
                value={appealData.appealBody}
                onChange={(e) =>
                  setAppealData({ ...appealData, appealBody: e.target.value })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs font-mono text-slate-200 leading-relaxed focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Paste directly into the PayPal Resolution Center claim response form.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-800 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-900"
                >
                  Close
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-1.5 font-semibold text-white hover:bg-purple-500 shadow-md transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Rebuttal Text
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
