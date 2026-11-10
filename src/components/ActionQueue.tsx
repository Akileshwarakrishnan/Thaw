"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
  MessageSquare,
  ShieldAlert,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

export interface ActionItem {
  id: string;
  type: string;
  title: string;
  rationale: string;
  priority: number;
  expectedRiskDrop: number;
  status: "proposed" | "approved" | "rejected" | "executed" | "failed";
  source?: "LIVE_SANDBOX" | "SIMULATED";
  executionChannel?: string;
  payload: Record<string, any>;
  createdAt: string;
  order?: {
    id: string;
    paypalOrderId: string;
    amount: number;
    trackingStatus: string;
    isAddressMismatch: boolean;
  } | null;
  dispute?: {
    id: string;
    paypalDisputeId: string;
    reason: string;
    amount: number;
    status: string;
  } | null;
}

interface ActionQueueProps {
  actions: ActionItem[];
  onApprove: (actionId: string) => Promise<void>;
  onReject: (actionId: string) => Promise<void>;
  onOpenAppealModal?: (disputeId?: string, orderId?: string) => void;
}

export function ActionQueue({
  actions,
  onApprove,
  onReject,
  onOpenAppealModal,
}: ActionQueueProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await onReject(id);
    } finally {
      setProcessingId(null);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "upload_tracking":
        return <Truck className="h-4 w-4 text-[#367eed]" />;
      case "refund":
        return <RotateCcw className="h-4 w-4 text-amber-600" />;
      case "draft_reply":
      case "appeal":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-rose-600" />;
    }
  };

  const getWeightImpact = (type: string, drop: number) => {
    switch (type) {
      case "upload_tracking":
        return {
          label: "Missing Tracking Weight",
          maxWeight: 25,
          citation: "PayPal Help Center FAQ1265 (Fulfillment Hold Gate)",
        };
      case "draft_reply":
      case "appeal":
        return {
          label: "Dispute Risk Weight",
          maxWeight: 30,
          citation: "PayPal User Agreement §10 (Chargeback Threshold)",
        };
      case "refund":
        return {
          label: "Address Mismatch & Fee Defense",
          maxWeight: 10,
          citation: "Seller Protection Policy §3",
        };
      case "pre_notify_spike":
        return {
          label: "Volume Velocity Underwriting",
          maxWeight: 20,
          citation: "PayPal Underwriting Growth Guidelines",
        };
      default:
        return {
          label: "General Account Weight",
          maxWeight: 10,
          citation: "PayPal Underwriting Policy",
        };
    }
  };

  return (
    <div className="bg-white rounded-[10px] p-6 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d4d7dc] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#e5f0ff] p-2 text-[#367eed]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1f2328]">
              AI Action Agent (Human Approval-Gated)
            </h3>
            <p className="text-xs text-[#535963]">
              The AI proposes solutions. Zero money or tracking moves without your explicit manual approval.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#f6f6f6] border border-[#d4d7dc] px-3 py-1 text-xs font-semibold text-[#1f2328]">
          {actions.filter((a) => a.status === "proposed").length} Actions Queued
        </span>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#d4d7dc] p-10 text-center text-xs text-[#535963]">
            No actions currently required. All order shipments and disputes are in good standing!
          </div>
        ) : (
          actions.map((action) => {
            const isProcessing = processingId === action.id;
            const isProposed = action.status === "proposed";
            const isExecuted = action.status === "executed";
            const isRejected = action.status === "rejected";

            return (
              <div
                key={action.id}
                className={`rounded-[10px] border p-4 transition-all ${
                  isExecuted
                    ? "border-emerald-300 bg-emerald-50/40"
                    : isRejected
                    ? "border-[#d4d7dc] bg-[#f6f6f6] opacity-60"
                    : "border-[#d4d7dc] bg-white hover:border-[#367eed] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Icon & Details */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-[#f6f6f6] px-3 py-0.5 text-xs font-bold text-[#1f2328] border border-[#d4d7dc]">
                        {getActionIcon(action.type)}
                        <span className="capitalize">{action.type.replace(/_/g, " ")}</span>
                      </div>

                      <span className="font-bold text-[#1f2328] text-sm">
                        {action.title}
                      </span>

                      {/* Execution Channel */}
                      <span className="rounded-full bg-[#e5f0ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1b63d2] border border-[#accfff]">
                        {action.executionChannel === "REST_FALLBACK" ? "PayPal REST Client" : "PayPal Agent Toolkit (MCP)"}
                      </span>

                      {/* Source */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          action.source === "LIVE_SANDBOX"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-[#f6f6f6] text-[#535963] border-[#d4d7dc]"
                        }`}
                      >
                        {action.source === "LIVE_SANDBOX" ? "Live Sandbox" : "Simulated"}
                      </span>

                      {/* Expected Risk Drop */}
                      <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <ArrowDownRight className="h-3 w-3" />
                        -{action.expectedRiskDrop} pts
                      </span>

                      {/* Weight Impact Badge */}
                      {(() => {
                        const impact = getWeightImpact(action.type, action.expectedRiskDrop);
                        return (
                          <span
                            className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#f0f5f7] px-2.5 py-0.5 text-[10px] font-medium text-[#1c346c] border border-[#a2b4cc]/50"
                            title={`Removes risk exposure against ${impact.label} (${impact.maxWeight}% max weight). Citation: ${impact.citation}`}
                          >
                            <span className="font-semibold text-[#1f2328]">Weight Impact:</span> -{action.expectedRiskDrop} pts from {impact.label} ({impact.maxWeight}% max)
                          </span>
                        );
                      })()}
                    </div>

                    <p className="text-xs text-[#535963] leading-relaxed">
                      {action.rationale}
                    </p>

                    {/* Target Context */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#535963] pt-0.5">
                      {action.order && (
                        <span>
                          Order:{" "}
                          <strong className="text-[#1f2328] font-mono">
                            #{action.order.paypalOrderId}
                          </strong>{" "}
                          (${action.order.amount.toFixed(2)})
                        </span>
                      )}
                      {action.dispute && (
                        <span>
                          Dispute:{" "}
                          <strong className="text-[#1f2328] font-mono">
                            #{action.dispute.paypalDisputeId}
                          </strong>{" "}
                          ({action.dispute.reason})
                        </span>
                      )}
                      {action.payload?.carrier && (
                        <span>
                          Carrier:{" "}
                          <strong className="text-[#1f2328]">
                            {action.payload.carrier}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isExecuted && (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                        Executed via PayPal
                      </span>
                    )}

                    {isRejected && (
                      <span className="flex items-center gap-1 rounded-full bg-[#f6f6f6] px-3 py-1 text-xs font-medium text-[#535963] border border-[#d4d7dc]">
                        <XCircle className="h-3.5 w-3.5" />
                        Rejected
                      </span>
                    )}

                    {isProposed && (
                      <>
                        {action.type === "draft_reply" && onOpenAppealModal && (
                          <button
                            onClick={() =>
                              onOpenAppealModal(
                                action.dispute?.id,
                                action.order?.id
                              )
                            }
                            className="rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors shadow-xs"
                          >
                            Preview Rebuttal
                          </button>
                        )}

                        <button
                          onClick={() => handleReject(action.id)}
                          disabled={isProcessing}
                          className="rounded-full border border-[#d4d7dc] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#535963] hover:text-[#1f2328] hover:bg-[#f6f6f6] transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleApprove(action.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 rounded-full bg-[#1f2328] hover:bg-[#343941] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                          Approve & Execute
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
