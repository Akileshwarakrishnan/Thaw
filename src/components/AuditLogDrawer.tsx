"use client";

import React from "react";
import { History, Shield, Bot, User, CheckCircle, AlertCircle } from "lucide-react";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: "system" | "ai" | "seller" | string;
  event: string;
  details: Record<string, any>;
}

interface AuditLogDrawerProps {
  logs: AuditEntry[];
}

export function AuditLogDrawer({ logs }: AuditLogDrawerProps) {
  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "ai":
        return (
          <span className="flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
            <Bot className="h-3 w-3 text-purple-700" />
            AI Agent
          </span>
        );
      case "seller":
        return (
          <span className="flex items-center gap-1 rounded-md bg-[#84bbe3]/20 px-2 py-0.5 text-[10px] font-bold text-[#1c346c] border border-[#84bbe3]/40">
            <User className="h-3 w-3 text-[#1c346c]" />
            Merchant
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded-md bg-[#F0F5F7] px-2 py-0.5 text-[10px] font-bold text-[#526699] border border-[#E4E6EE]">
            <Shield className="h-3 w-3 text-[#64759d]" />
            System
          </span>
        );
    }
  };

  return (
    <div className="casper-card casper-card-hover p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E6EE] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#F0F5F7] p-2 text-[#4a4af4] border border-[#E4E6EE]">
            <History className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-[#1c346c]">
            Immutable Audit Trail & Webhook Telemetry
          </h3>
        </div>
        <span className="text-xs text-[#526699]">
          Verifiable ledger of every AI proposal, merchant approval, and PayPal event
        </span>
      </div>

      {/* Log Feed */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-[#526699] text-center py-8">
            No audit records logged yet.
          </p>
        ) : (
          logs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#E4E6EE] bg-[#F0F5F7]/50 p-2.5 text-xs hover:bg-[#F0F5F7] hover:border-[#84bbe3] transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-[11px] text-[#64759d] shrink-0 font-medium">
                    {timeStr}
                  </span>
                  {getActorBadge(log.actor)}
                  <span className="font-bold text-[#1c346c]">
                    {log.event.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-[11px] text-[#526699] truncate max-w-md">
                  {log.details?.title ||
                    log.details?.message ||
                    (log.details?.score !== undefined ? `Score: ${log.details.score}/100 (${log.details.band})` : "") ||
                    (log.details?.eventType ? `Event: ${log.details.eventType}` : "") ||
                    JSON.stringify(log.details)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
