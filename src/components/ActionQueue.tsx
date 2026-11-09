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
        return <Truck className="h-4 w-4 text-[#1c346c]" />;
      case "refund":
        return <RotateCcw className="h-4 w-4 text-amber-600" />;
      case "draft_reply":
      case "appeal":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-[#cc352c]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E4E6EE] shadow-sm hover:shadow-md transition-shadow space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E6EE] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#84bbe3]/20 p-2 text-[#1c346c]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1c346c]">
              AI Action Agent (Human Approval-Gated)
            </h3>
            <p className="text-xs text-[#526699]">
              The AI proposes solutions. Zero money or tracking moves without your explicit approval.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#F0F5F7] border border-[#E4E6EE] px-3 py-1 text-xs font-bold text-[#1c346c]">
          {actions.filter((a) => a.status === "proposed").length} Pending Actions
        </span>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E4E6EE] p-8 text-center text-xs text-[#64759d]">
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
                className={`rounded-xl border p-4 transition-all ${
                  isExecuted
                    ? "border-emerald-300 bg-emerald-50/50"
                    : isRejected
                    ? "border-slate-200 bg-slate-50 opacity-60"
                    : "border-[#E4E6EE] bg-white hover:border-[#84bbe3] shadow-xs"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Icon & Title & Rationale */}
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-[#F0F5F7] px-2.5 py-1 text-xs font-bold text-[#1c346c]">
                        {getActionIcon(action.type)}
                        <span className="capitalize">{action.type.replace(/_/g, " ")}</span>
                      </div>

                      <span className="font-bold text-[#1c346c] text-sm">
                        {action.title}
                      </span>

                      {/* Execution Channel Badge */}
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1c346c] border border-blue-200">
                        {action.executionChannel === "REST_FALLBACK" ? "PayPal REST Client" : "PayPal Agent Toolkit (MCP)"}
                      </span>

                      {/* Source Badge */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          action.source === "LIVE_SANDBOX"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        {action.source === "LIVE_SANDBOX" ? "Live Sandbox" : "Simulated"}
                      </span>

                      {/* Expected Risk Drop */}
                      <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <ArrowDownRight className="h-3 w-3" />
                        -{action.expectedRiskDrop} pts
                      </span>
                    </div>

                    <p className="text-xs text-[#526699] leading-relaxed font-normal">
                      {action.rationale}
                    </p>

                    {/* Target Context */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64759d] pt-1">
                      {action.order && (
                        <span>
                          Order:{" "}
                          <strong className="text-[#1c346c]">
                            #{action.order.paypalOrderId}
                          </strong>{" "}
                          (${action.order.amount.toFixed(2)})
                        </span>
                      )}
                      {action.dispute && (
                        <span>
                          Dispute:{" "}
                          <strong className="text-[#1c346c]">
                            #{action.dispute.paypalDisputeId}
                          </strong>{" "}
                          ({action.dispute.reason})
                        </span>
                      )}
                      {action.payload?.carrier && (
                        <span>
                          Carrier:{" "}
                          <strong className="text-[#1c346c]">
                            {action.payload.carrier}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isExecuted && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        Executed & Synced to PayPal
                      </span>
                    )}

                    {isRejected && (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-300">
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
                            className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors shadow-xs"
                          >
                            Preview Rebuttal
                          </button>
                        )}

                        <button
                          onClick={() => handleReject(action.id)}
                          disabled={isProcessing}
                          className="rounded-lg border border-[#E4E6EE] bg-white px-3 py-1.5 text-xs font-medium text-[#526699] hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleApprove(action.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
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
