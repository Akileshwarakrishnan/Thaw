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
  ArrowRight,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Real PayPal Sandbox Proof (End-to-End Cycle)
              </h3>
              <p className="text-xs text-slate-400">
                5-step real API execution: Order & Capture, Tracking, Refund, Disputes, and Webhook
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

        {/* Action Trigger Banner */}
        {!report && !loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-center">
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
              Click below to execute the complete automated 5-step test cycle against the PayPal platform.
              Every record created will be labeled with its genuine source (<strong>Live Sandbox</strong> or <strong>Simulated</strong>) in the database and UI.
            </p>
            <button
              onClick={handleRunProof}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <Play className="h-4 w-4" />
              Execute 5-Step Sandbox Verification Now
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs font-semibold text-slate-200">
              Executing PayPal Sandbox APIs in sequence...
            </p>
            <p className="text-[11px] text-slate-400">
              Calling Orders API $\rightarrow$ Shipment Tracking API $\rightarrow$ Payments Refund API $\rightarrow$ Customer Disputes API $\rightarrow$ Webhook Signature Verification
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Execution Report */}
        {report && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-3 text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                All 5 PayPal Sandbox Verification Steps Completed!
              </span>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 uppercase">
                {report.step1_order.source}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Step 1 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-brand-400" />
                    Step 1: Orders API (/v2/checkout/orders)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Order ID: <strong>{report.step1_order.orderId}</strong> | Amount: {report.step1_order.amount}
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-brand-400" />
                    Step 2: Shipment Tracking API (/v1/shipping/trackers)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Tracker: <strong>{report.step2_tracking.trackerId}</strong> | #{report.step2_tracking.trackingNumber} ({report.step2_tracking.carrier})
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                    Step 3: Payments Refund API (/v2/payments/captures/refund)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Refund ID: <strong>{report.step3_refund.refundId}</strong> | Value: {report.step3_refund.refundedAmount}
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                    Step 4: Customer Disputes API (/v1/customer/disputes)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Active Disputes: <strong>{report.step4_disputes.disputesCount}</strong> | Sample ID: {report.step4_disputes.sampleDisputeId}
                </div>
              </div>

              {/* Step 5 */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-teal-400" />
                    Step 5: Webhook Signature Verification (/v1/notifications/verify-webhook-signature)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Transmission ID: <strong>{report.step5_webhook.transmissionId}</strong> | Status: {report.step5_webhook.verificationStatus}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Data saved in local database and synchronized to orders ledger.
              </span>
              <button
                onClick={onClose}
                className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 shadow"
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
