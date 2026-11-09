"use client";

import React, { useState } from "react";
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  FileText,
} from "lucide-react";

export interface OrderRow {
  id: string;
  paypalOrderId: string;
  captureId?: string | null;
  amount: number;
  currency: string;
  createdAt: string;
  buyerEmail: string;
  buyerName?: string | null;
  shipToAddress: string;
  transactionAddress: string;
  isAddressMismatch: boolean;
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingStatus: string;
  sellerProtectionStatus: string;
  refundedAmount: number;
  hasDispute: boolean;
  disputes: any[];
}

interface OrdersTableProps {
  orders: OrderRow[];
  onOpenAppealModal: (disputeId?: string, orderId?: string) => void;
}

export function OrdersTable({ orders, onOpenAppealModal }: OrdersTableProps) {
  const [filterTab, setFilterTab] = useState<"all" | "missing_tracking" | "mismatch" | "disputed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (filterTab === "missing_tracking" && order.trackingStatus !== "NONE") return false;
    if (filterTab === "mismatch" && !order.isAddressMismatch) return false;
    if (filterTab === "disputed" && !order.hasDispute) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.paypalOrderId.toLowerCase().includes(q);
      const matchEmail = order.buyerEmail.toLowerCase().includes(q);
      const matchTracking = order.trackingNumber?.toLowerCase().includes(q);
      return matchId || matchEmail || matchTracking;
    }
    return true;
  });

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-brand-400" />
            Orders & Underwriting Risk Ledger
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time feed of captured payments, shipment telemetry, and protection eligibility.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-900/90 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterTab("all")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterTab === "all"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilterTab("missing_tracking")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterTab === "missing_tracking"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Missing Tracking ({orders.filter((o) => o.trackingStatus === "NONE").length})
            </button>
            <button
              onClick={() => setFilterTab("mismatch")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterTab === "mismatch"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Address Mismatches ({orders.filter((o) => o.isAddressMismatch).length})
            </button>
            <button
              onClick={() => setFilterTab("disputed")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterTab === "disputed"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Disputes ({orders.filter((o) => o.hasDispute).length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order ID, buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800/80 bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-2.5 px-3">PayPal Order ID</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Buyer (Masked)</th>
              <th className="py-2.5 px-3">Tracking / Carrier</th>
              <th className="py-2.5 px-3">Seller Protection</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-normal">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No orders match the selected filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-900/40 transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-white">
                    #{order.paypalOrderId}
                    {order.hasDispute && (
                      <span className="ml-2 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                        Disputed
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    ${order.amount.toFixed(2)}
                    {order.refundedAmount > 0 && (
                      <span className="block text-[10px] text-amber-400 font-normal">
                        -${order.refundedAmount.toFixed(2)} refunded
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                    {order.buyerEmail}
                  </td>
                  <td className="py-3 px-3">
                    {order.trackingNumber ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-mono text-[11px]">
                          {order.carrier || "USPS"} {order.trackingNumber.slice(0, 10)}...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Untracked (&gt;3d)</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {order.isAddressMismatch ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        Address Mismatch (Void)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        Eligible
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {order.hasDispute ? (
                      <button
                        onClick={() =>
                          onOpenAppealModal(order.disputes[0]?.id, order.id)
                        }
                        className="inline-flex items-center gap-1 rounded bg-purple-600/80 px-2 py-1 text-[11px] font-semibold text-white hover:bg-purple-500 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        Draft Appeal
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Protected</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
