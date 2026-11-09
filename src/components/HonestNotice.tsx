"use client";

import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

export function HonestNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-red-100 p-2 text-[#cc352c] shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm leading-relaxed text-[#1c346c]">
          <span className="font-bold text-[#cc352c]">
            Honest Proxy Limitation:
          </span>{" "}
          PayPal&apos;s real internal risk model is proprietary.
          Thaw is an independent early-warning shield built strictly from
          publicly documented merchant signals, dispute velocity rules, and
          fulfillment requirements. Built for PayPal sellers to prevent surprise
          cash freezes.
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-[#64759d] hover:bg-red-100 hover:text-black transition-colors"
          title="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
