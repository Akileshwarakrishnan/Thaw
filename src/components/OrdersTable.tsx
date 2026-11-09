"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
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
  source?: "LIVE_SANDBOX" | "SIMULATED";
  hasDispute: boolean;
  disputes: any[];
}

interface OrdersTableProps {
  orders: OrderRow[];
  onOpenAppealModal: (disputeId?: string, orderId?: string) => void;
}

const PAGE_SIZE = 8;

export function OrdersTable({ orders, onOpenAppealModal }: OrdersTableProps) {
  const [filterTab, setFilterTab] = useState<"all" | "missing_tracking" | "mismatch" | "disputed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Automatically reset to page 1 whenever orders data or active filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [orders, filterTab]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
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
  }, [orders, filterTab, searchQuery]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safeCurrentPage]);

  // Compute smart visible pages list (handles 1..N pages without overflowing)
  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, safeCurrentPage]);

  const handleTabChange = (tab: "all" | "missing_tracking" | "mismatch" | "disputed") => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-[10px] border border-[#d4d7dc] shadow-[0_0_20px_rgba(27,37,40,0.04)] p-6 space-y-5">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d4d7dc] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#1f2328] tracking-tight">
              Orders & Underwriting Telemetry Ledger
            </h3>
            <span className="rounded-full bg-[#f6f6f6] border border-[#d4d7dc] px-2.5 py-0.5 text-xs font-semibold text-[#535963]">
              {orders.length} Total Captured
            </span>
          </div>
          <p className="text-xs text-[#535963] mt-0.5">
            Real-time feed of captured payments, carrier tracking status, and PayPal Seller Protection eligibility.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#535963]" />
          <input
            type="text"
            placeholder="Search order ID, email, tracker..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-full border border-[#d4d7dc] bg-[#f6f6f6] pl-9 pr-4 py-2 text-xs text-[#1f2328] placeholder-[#535963] focus:border-[#367eed] focus:bg-white focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs (Statsig style pills) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleTabChange("all")}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
            filterTab === "all"
              ? "bg-[#1f2328] text-white shadow-sm"
              : "bg-[#f6f6f6] text-[#535963] hover:text-[#1f2328] border border-[#d4d7dc]"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => handleTabChange("missing_tracking")}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
            filterTab === "missing_tracking"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          Missing Tracking ({orders.filter((o) => o.trackingStatus === "NONE").length})
        </button>
        <button
          onClick={() => handleTabChange("mismatch")}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
            filterTab === "mismatch"
              ? "bg-[#343941] text-white shadow-sm"
              : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
          }`}
        >
          Address Mismatches ({orders.filter((o) => o.isAddressMismatch).length})
        </button>
        <button
          onClick={() => handleTabChange("disputed")}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
            filterTab === "disputed"
              ? "bg-[#1b63d2] text-white shadow-sm"
              : "bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100"
          }`}
        >
          Disputed Orders ({orders.filter((o) => o.hasDispute).length})
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-[10px] border border-[#d4d7dc]">
        <table className="w-full text-left text-xs text-[#1f2328]">
          <thead className="bg-[#f6f6f6] border-b border-[#d4d7dc] text-[11px] font-semibold uppercase tracking-wider text-[#535963]">
            <tr>
              <th className="py-3 px-4">Order & Telemetry</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3">Buyer</th>
              <th className="py-3 px-3">Shipment Tracking</th>
              <th className="py-3 px-3">Seller Protection</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4d7dc] font-normal bg-white">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#535963]">
                  No orders match your current filter or query.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#f6f6f6]/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-[#1f2328]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs">#{order.paypalOrderId}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          order.source === "LIVE_SANDBOX"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-[#f6f6f6] text-[#535963] border-[#d4d7dc]"
                        }`}
                      >
                        {order.source === "LIVE_SANDBOX" ? "Live Sandbox" : "Simulated"}
                      </span>
                      {order.hasDispute && (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                          Disputed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[#535963]">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#1f2328]">
                    ${order.amount.toFixed(2)}
                    {order.refundedAmount > 0 && (
                      <span className="block text-[10px] text-amber-700 font-normal">
                        -${order.refundedAmount.toFixed(2)} refund
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-[#535963]">
                    {order.buyerEmail}
                  </td>
                  <td className="py-3.5 px-3">
                    {order.trackingStatus === "SHIPPED" ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{order.carrier}</span>
                        <span className="text-[10px] text-[#535963] font-mono">
                          ({order.trackingNumber?.slice(-6)})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>No Tracking</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    {order.isAddressMismatch ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                        <XCircle className="h-3 w-3" />
                        Address Mismatch
                      </span>
                    ) : order.sellerProtectionStatus === "ELIGIBLE" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" />
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f6f6] px-2.5 py-0.5 text-[10px] font-semibold text-[#535963] border border-[#d4d7dc]">
                        <ShieldAlert className="h-3 w-3" />
                        Ineligible
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {order.hasDispute ? (
                      <button
                        onClick={() =>
                          onOpenAppealModal(order.disputes?.[0]?.disputeId, order.id)
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-[#367eed] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[#1b63d2] transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        AI Rebuttal
                      </button>
                    ) : (
                      <span className="text-xs text-[#535963]">Clean</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (Smart, elegant, zero-clutter) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-[#535963]">
          Showing{" "}
          <strong className="text-[#1f2328]">
            {filteredOrders.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}
          </strong>{" "}
          to{" "}
          <strong className="text-[#1f2328]">
            {Math.min(safeCurrentPage * PAGE_SIZE, filteredOrders.length)}
          </strong>{" "}
          of <strong className="text-[#1f2328]">{filteredOrders.length}</strong> orders
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="flex items-center gap-1 rounded-full border border-[#d4d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2328] hover:bg-[#f6f6f6] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {visiblePages.map((pageItem, idx) => {
              if (pageItem === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#535963]">
                    ...
                  </span>
                );
              }
              const pNum = Number(pageItem);
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`h-7 w-7 rounded-full text-xs font-semibold transition-all ${
                    pNum === safeCurrentPage
                      ? "bg-[#1f2328] text-white shadow-xs font-bold"
                      : "text-[#535963] hover:bg-[#f6f6f6] hover:text-[#1f2328]"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages || totalPages === 0}
            className="flex items-center gap-1 rounded-full border border-[#d4d7dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2328] hover:bg-[#f6f6f6] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
