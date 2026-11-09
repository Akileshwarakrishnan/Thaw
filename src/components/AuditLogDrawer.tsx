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
          <span className="flex items-center gap-1 rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
            <Bot className="h-3 w-3" />
            AI Agent
          </span>
        );
      case "seller":
        return (
          <span className="flex items-center gap-1 rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-500/30">
            <User className="h-3 w-3" />
            Merchant
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
            <Shield className="h-3 w-3 text-slate-400" />
            System
          </span>
        );
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-400" />
          <h3 className="text-base font-semibold text-white">
            Immutable Audit Trail & Webhook Telemetry
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Complete compliance ledger of all decisions and PayPal events
        </span>
      </div>

      {/* Log Feed */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-800/70 bg-slate-900/40 p-2.5 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {timeStr}
                  </span>
                  {getActorBadge(log.actor)}
                  <span className="font-semibold text-slate-200">
                    {log.event.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 truncate max-w-sm">
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
