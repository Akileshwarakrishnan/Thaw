"use client";

import React from "react";
import { SlidersHorizontal, ExternalLink, BookOpen } from "lucide-react";
import { RiskSignalsBreakdown } from "@/lib/risk/types";

interface SignalMetersProps {
  signals: RiskSignalsBreakdown;
}

const SIGNAL_EVIDENCE_MAP: Record<
  string,
  { sourceName: string; ruleSummary: string; docUrl: string }
> = {
  disputeRate: {
    sourceName: "PayPal User Agreement §10 & Chargeback Guide",
    ruleSummary: "Accounts exceeding 1.5% dispute ratios enter high-risk monitoring requiring 10-30% rolling reserves.",
    docUrl: "https://www.paypal.com/us/legalhub/useragreement-full#restricted-activities",
  },
  missingTracking: {
    sourceName: "PayPal Help Center: Why is my payment on hold?",
    ruleSummary: "Funds are automatically held for 21 days for physical shipments dispatched without carrier delivery tracking.",
    docUrl: "https://www.paypal.com/us/smarthelp/article/why-is-my-payment-on-hold-faq1265",
  },
  volumeSpike: {
    sourceName: "PayPal Merchant Risk: Sales Velocity Spikes",
    ruleSummary: "Surges >2x normal weekly run-rate trigger automated reserve holds to protect against fulfillment failure.",
    docUrl: "https://www.paypal.com/us/business/risk-management",
  },
  addressMismatch: {
    sourceName: "PayPal Seller Protection Policy §3",
    ruleSummary: "Dispatching orders to unconfirmed addresses voids Seller Protection, leaving merchants 100% exposed to chargeback fees.",
    docUrl: "https://www.paypal.com/us/webapps/mpp/security/seller-protection",
  },
  refundRate: {
    sourceName: "PayPal Underwriting Reserve Guidelines",
    ruleSummary: "Elevated refund velocity (>6%) signals customer dissatisfaction, prompting PayPal to establish reserves.",
    docUrl: "https://www.paypal.com/us/brc/article/understanding-reserves",
  },
  disputeDeadlines: {
    sourceName: "PayPal Resolution Center 48h Response Rule",
    ruleSummary: "Claims unanswered within 48h of deadline automatically forfeit funds to buyer with an irreversible defect strike.",
    docUrl: "https://www.paypal.com/us/smarthelp/article/how-do-i-respond-to-a-dispute-faq406",
  },
};

export function SignalMeters({ signals }: SignalMetersProps) {
  if (!signals || Object.keys(signals).length === 0) return null;

  const signalItems = [
    { key: "disputeRate", data: signals.disputeRate },
    { key: "missingTracking", data: signals.missingTracking },
    { key: "volumeSpike", data: signals.volumeSpike },
    { key: "addressMismatch", data: signals.addressMismatch },
    { key: "refundRate", data: signals.refundRate },
    { key: "disputeDeadlines", data: signals.disputeDeadlines },
  ];

  return (
    <div className="bg-white rounded-[10px] p-6 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d4d7dc] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#e5f0ff] p-2 text-[#367eed]">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1f2328]">
              Deterministic Signal Breakdown & Trigger Weights
            </h3>
            <p className="text-xs text-[#535963]">
              6 Publicly Documented Underwriting Triggers (Deterministic Sum = 100 pts)
            </p>
          </div>
        </div>
        <span className="text-xs text-[#535963] font-semibold bg-[#f6f6f6] px-3 py-1 rounded-full border border-[#d4d7dc]">
          Documented Proxy Model
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signalItems.map(({ key, data }) => {
          if (!data) return null;
          const evidence = SIGNAL_EVIDENCE_MAP[key];

          const statusColor =
            data.status === "CRITICAL"
              ? {
                  badge: "bg-rose-50 text-rose-700 border-rose-200",
                  bar: "bg-rose-600",
                }
              : data.status === "ELEVATED"
              ? {
                  badge: "bg-amber-50 text-amber-800 border-amber-200",
                  bar: "bg-amber-500",
                }
              : {
                  badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  bar: "bg-emerald-500",
                };

          const pct = Math.min(Math.round((data.contribution / data.weight) * 100), 100);

          return (
            <div
              key={key}
              className="rounded-[10px] border border-[#d4d7dc] bg-white p-4 space-y-3 hover:border-[#367eed] transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1f2328]">
                      {data.name}
                    </h4>
                    <span className="text-[11px] text-[#535963]">
                      Weight: {data.weight} pts max
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${statusColor.badge}`}
                  >
                    {data.status}
                  </span>
                </div>

                {/* Metric & Points */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-[#1f2328]">
                      {data.displayValue}
                    </span>
                    <span className="block text-[10px] text-[#535963]">
                      Raw Metric
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#1f2328]">
                      +{data.contribution.toFixed(1)}
                    </span>
                    <span className="block text-[10px] text-[#535963]">
                      pts added
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-[#f6f6f6] overflow-hidden border border-[#d4d7dc]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#535963]">
                    <span>Safe (0)</span>
                    <span>{pct}% Impact</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs leading-relaxed text-[#535963] pt-1 border-t border-[#f6f6f6]">
                  {data.description}
                </p>
              </div>

              {/* Public Documentation Evidence Link */}
              {evidence && (
                <div className="mt-2 pt-2 border-t border-[#d4d7dc] rounded-[8px] bg-[#f6f6f6] p-2.5 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[#535963]">
                    <span className="font-bold text-[#1f2328] flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-[#367eed]" />
                      Public Trigger Rule:
                    </span>
                    <a
                      href={evidence.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#367eed] hover:text-[#1b63d2] flex items-center gap-0.5 font-bold"
                      title="View official PayPal documentation"
                    >
                      Docs <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-[#535963] leading-snug">
                    {evidence.ruleSummary}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
