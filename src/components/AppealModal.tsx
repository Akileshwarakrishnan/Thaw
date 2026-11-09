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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E4E6EE] bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E6EE] pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-100 p-2 text-purple-800">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1c346c]">
                AI Dispute Appeal & Rebuttal Drafter
              </h3>
              <p className="text-xs text-[#526699]">
                Structured directly to satisfy PayPal Underwriting & Claims Review specifications.
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

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#4a4af4]" />
            <p className="text-xs text-[#526699] font-medium">
              Analyzing dispute allegations, carrier tracking telemetry, and PayPal Seller Protection eligibility...
            </p>
          </div>
        ) : appealData ? (
          <div className="space-y-4 text-xs">
            {/* Confidence & Policy Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-purple-50 border border-purple-200 p-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold">
                <ShieldCheck className="h-4 w-4 text-purple-700" />
                <span>Confidence: {appealData.confidenceRating}</span>
              </div>
              <span className="text-[11px] text-[#526699] font-medium">
                Complies with PayPal Seller Protection Criteria
              </span>
            </div>

            {/* Evidence Checklist */}
            <div className="rounded-xl border border-[#E4E6EE] bg-[#F0F5F7]/70 p-3.5 space-y-2">
              <span className="font-bold text-[#1c346c] uppercase tracking-wider text-[11px] block">
                Evidence Attached by AI:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {appealData.evidenceList.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-1.5 text-[#1c346c] text-[11px] font-medium"
                  >
                    <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#526699] uppercase tracking-wider">
                Subject Line
              </label>
              <input
                type="text"
                readOnly
                value={appealData.subject}
                className="w-full rounded-lg border border-[#E4E6EE] bg-[#F0F5F7] px-3 py-2 text-xs text-[#1c346c] font-semibold"
              />
            </div>

            {/* Appeal Body */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#526699] uppercase tracking-wider">
                Official Rebuttal Body
              </label>
              <textarea
                rows={10}
                value={appealData.appealBody}
                onChange={(e) =>
                  setAppealData({ ...appealData, appealBody: e.target.value })
                }
                className="w-full rounded-lg border border-[#E4E6EE] bg-white p-3 text-xs font-mono text-[#1c346c] leading-relaxed focus:border-[#4a4af4] focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-[#526699]">
                Paste directly into the PayPal Resolution Center claim response form.
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[#E4E6EE] px-3.5 py-1.5 font-bold text-[#526699] hover:bg-[#F0F5F7] hover:text-[#1c346c] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-[#1c346c] px-4 py-1.5 font-bold text-white hover:bg-[#152752] shadow-md transition-colors"
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
