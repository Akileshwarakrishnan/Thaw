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
          <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
            <Bot className="h-3 w-3" />
            AI Agent
          </span>
        );
      case "seller":
        return (
          <span className="flex items-center gap-1 rounded-full bg-[#e5f0ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1b63d2] border border-[#accfff]">
            <User className="h-3 w-3" />
            Merchant
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded-full bg-[#f6f6f6] px-2.5 py-0.5 text-[10px] font-bold text-[#535963] border border-[#d4d7dc]">
            <Shield className="h-3 w-3" />
            System
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[10px] p-6 border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d4d7dc] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#e5f0ff] p-2 text-[#367eed]">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1f2328]">
              Immutable Audit Trail & Webhook Telemetry
            </h3>
            <p className="text-xs text-[#535963]">
              Verifiable log of every AI diagnosis, merchant approval, and PayPal webhook event.
            </p>
          </div>
        </div>
        <span className="text-xs text-[#535963] font-semibold bg-[#f6f6f6] px-3 py-1 rounded-full border border-[#d4d7dc]">
          {logs.length} Total Audit Records
        </span>
      </div>

      {/* Log Feed */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-[#535963] text-center py-8">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6]/60 p-3 text-xs hover:bg-[#f6f6f6] hover:border-[#367eed] transition-all"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-[11px] text-[#535963] shrink-0 font-medium">
                    {timeStr}
                  </span>
                  {getActorBadge(log.actor)}
                  <span className="font-bold text-[#1f2328]">
                    {log.event.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-[11px] text-[#535963] truncate max-w-md font-mono">
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
