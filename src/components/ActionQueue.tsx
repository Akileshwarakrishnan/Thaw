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
  Flame,
  ArrowDownRight,
  Send,
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
        return <Truck className="h-4 w-4 text-brand-400" />;
      case "refund":
        return <RotateCcw className="h-4 w-4 text-amber-400" />;
      case "draft_reply":
      case "appeal":
        return <MessageSquare className="h-4 w-4 text-purple-400" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-brand-500/10 p-1.5 text-brand-400 border border-brand-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              AI Action Agent (Human-in-the-Loop Gated)
            </h3>
            <p className="text-[11px] text-slate-400">
              The AI proposes remediations. Zero money or tracking moves without your explicit click.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
          {actions.filter((a) => a.status === "proposed").length} Pending Approval
        </span>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
            No active actions proposed. All order fulfillments and disputes are clear!
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
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : isRejected
                    ? "border-slate-800 bg-slate-950/40 opacity-60"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Icon & Title & Rationale */}
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200">
                        {getActionIcon(action.type)}
                        <span className="capitalize">{action.type.replace(/_/g, " ")}</span>
                      </div>

                      <span className="font-semibold text-white text-sm">
                        {action.title}
                      </span>

                      {/* Expected Risk Drop */}
                      <span className="flex items-center gap-0.5 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                        <ArrowDownRight className="h-3 w-3" />
                        -{action.expectedRiskDrop} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {action.rationale}
                    </p>

                    {/* Target Context */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      {action.order && (
                        <span>
                          Order:{" "}
                          <strong className="text-slate-200">
                            #{action.order.paypalOrderId}
                          </strong>{" "}
                          (${action.order.amount.toFixed(2)})
                        </span>
                      )}
                      {action.dispute && (
                        <span>
                          Dispute:{" "}
                          <strong className="text-slate-200">
                            #{action.dispute.paypalDisputeId}
                          </strong>{" "}
                          ({action.dispute.reason})
                        </span>
                      )}
                      {action.payload?.carrier && (
                        <span>
                          Carrier:{" "}
                          <strong className="text-slate-200">
                            {action.payload.carrier}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isExecuted && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        Executed & Synced
                      </span>
                    )}

                    {isRejected && (
                      <span className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400 border border-slate-700">
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
                            className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
                          >
                            Preview Rebuttal
                          </button>
                        )}

                        <button
                          onClick={() => handleReject(action.id)}
                          disabled={isProcessing}
                          className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleApprove(action.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors disabled:opacity-50"
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
