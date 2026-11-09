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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-[10px] border border-[#d4d7dc] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.15)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#e5f0ff] p-2 text-[#367eed]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f2328]">
                AI Dispute Appeal & Rebuttal Drafter
              </h3>
              <p className="text-xs text-[#535963]">
                Structured directly to satisfy PayPal Claims Review & Seller Protection requirements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#535963] hover:bg-[#f6f6f6] hover:text-[#1f2328]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#367eed]" />
            <p className="text-xs text-[#535963] font-medium">
              Analyzing dispute allegations, carrier tracking telemetry, and PayPal Seller Protection eligibility...
            </p>
          </div>
        ) : appealData ? (
          <div className="space-y-4 text-xs">
            {/* Confidence & Policy Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-purple-50 border border-purple-200 p-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold">
                <ShieldCheck className="h-4 w-4 text-purple-700" />
                <span>Confidence: {appealData.confidenceRating}</span>
              </div>
              <span className="text-xs text-[#535963] font-medium">
                Complies with PayPal Seller Protection Criteria
              </span>
            </div>

            {/* Evidence Checklist */}
            <div className="rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] p-3.5 space-y-2">
              <span className="font-bold text-[#1f2328] uppercase tracking-wider text-[11px] block">
                Evidence Attached by AI:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {appealData.evidenceList.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-1.5 text-[#1f2328] text-xs font-medium"
                  >
                    <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#535963] uppercase tracking-wider">
                Subject Line
              </label>
              <input
                type="text"
                readOnly
                value={appealData.subject}
                className="w-full rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] px-3 py-2 text-xs text-[#1f2328] font-semibold"
              />
            </div>

            {/* Appeal Body */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#535963] uppercase tracking-wider">
                Official Rebuttal Body
              </label>
              <textarea
                rows={10}
                value={appealData.appealBody}
                onChange={(e) =>
                  setAppealData({ ...appealData, appealBody: e.target.value })
                }
                className="w-full rounded-[8px] border border-[#d4d7dc] bg-white p-3 text-xs font-mono text-[#1f2328] leading-relaxed focus:border-[#367eed] focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#535963]">
                Paste directly into the PayPal Resolution Center claim response form.
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={onClose}
                  className="rounded-full border border-[#d4d7dc] px-4 py-1.5 font-bold text-[#535963] hover:bg-[#f6f6f6] hover:text-[#1f2328] transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-full bg-[#1f2328] hover:bg-[#343941] px-5 py-1.5 font-bold text-white shadow-sm transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Copied!
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
