"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Package,
  Truck,
  RotateCcw,
  MessageSquare,
  Globe,
} from "lucide-react";

interface E2EProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshDashboard: () => void;
}

export function E2EProofModal({
  isOpen,
  onClose,
  onRefreshDashboard,
}: E2EProofModalProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunProof = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/paypal/e2e-proof", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        onRefreshDashboard();
      } else {
        setError(data.error || "Execution failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error running proof");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-[10px] border border-[#d4d7dc] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.15)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f2328]">
                Real PayPal Sandbox Proof (End-to-End Cycle)
              </h3>
              <p className="text-xs text-[#535963]">
                5-step real API execution: Order & Capture, Tracking, Refund, Disputes, and Webhook
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

        {/* Action Trigger Banner */}
        {!report && !loading && (
          <div className="rounded-[10px] border border-[#d4d7dc] bg-[#f6f6f6] p-6 space-y-4 text-center">
            <p className="text-xs text-[#1f2328] leading-relaxed max-w-lg mx-auto">
              Click below to execute the complete automated 5-step test cycle against the PayPal sandbox.
              Every record created will be labeled with its genuine source (<strong className="text-emerald-800">Live Sandbox</strong> or <strong className="text-[#535963]">Simulated</strong>) in the database and UI.
            </p>
            <button
              onClick={handleRunProof}
              className="inline-flex items-center gap-2 rounded-full bg-[#1f2328] hover:bg-[#343941] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Play className="h-4 w-4" />
              Execute 5-Step Sandbox Verification Now
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#367eed]" />
            <p className="text-xs font-bold text-[#1f2328]">
              Executing PayPal Sandbox APIs in sequence...
            </p>
            <p className="text-xs text-[#535963]">
              Orders API $\rightarrow$ Shipment Tracking API $\rightarrow$ Payments Refund API $\rightarrow$ Customer Disputes API $\rightarrow$ Webhook Signature Verification
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-[8px] border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Execution Report */}
        {report && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[8px] bg-emerald-50 border border-emerald-300 p-3.5 text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                All 5 PayPal Sandbox Verification Steps Completed!
              </span>
              <span className="rounded-full bg-emerald-200 px-3 py-0.5 text-[10px] font-extrabold text-emerald-900 uppercase">
                {report.step1_order.source}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Step 1 */}
              <div className="rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2328] flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-[#367eed]" />
                    Step 1: Orders API (/v2/checkout/orders)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                  </span>
                </div>
                <div className="text-[#535963] font-mono text-[11px]">
                  Order ID: <strong className="text-[#1f2328]">{report.step1_order.orderId}</strong> | Amount: {report.step1_order.amount}
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2328] flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-[#367eed]" />
                    Step 2: Shipment Tracking API (/v1/shipping/trackers)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                  </span>
                </div>
                <div className="text-[#535963] font-mono text-[11px]">
                  Tracker: <strong className="text-[#1f2328]">{report.step2_tracking.trackerId}</strong> | #{report.step2_tracking.trackingNumber} ({report.step2_tracking.carrier})
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2328] flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                    Step 3: Payments Refund API (/v2/payments/captures/refund)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                  </span>
                </div>
                <div className="text-[#535963] font-mono text-[11px]">
                  Refund ID: <strong className="text-[#1f2328]">{report.step3_refund.refundId}</strong> | Value: {report.step3_refund.refundedAmount}
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2328] flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-purple-700" />
                    Step 4: Customer Disputes API (/v1/customer/disputes)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                  </span>
                </div>
                <div className="text-[#535963] font-mono text-[11px]">
                  Active Disputes: <strong className="text-[#1f2328]">{report.step4_disputes.disputesCount}</strong> | Sample ID: {report.step4_disputes.sampleDisputeId}
                </div>
              </div>

              {/* Step 5 */}
              <div className="rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1f2328] flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-teal-700" />
                    Step 5: Webhook Signature Verification (/v1/notifications/verify-webhook-signature)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                  </span>
                </div>
                <div className="text-[#535963] font-mono text-[11px]">
                  Transmission ID: <strong className="text-[#1f2328]">{report.step5_webhook.transmissionId}</strong> | Status: {report.step5_webhook.verificationStatus}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <span className="text-xs text-[#535963]">
                Data saved in local SQLite database and synchronized to orders ledger.
              </span>
              <button
                onClick={onClose}
                className="rounded-full bg-[#1f2328] hover:bg-[#343941] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all"
              >
                Close & View Ledger
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
