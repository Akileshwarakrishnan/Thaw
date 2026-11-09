"use client";

import React, { useState } from "react";
import { Info, X, ShieldAlert } from "lucide-react";

export function HonestNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#84bbe3]/30 bg-[#1c346c]/25 p-4 backdrop-blur-md shadow-casper-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-[#cc352c]/15 p-2 text-[#cc352c] border border-[#cc352c]/25">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm leading-relaxed text-[#F0F5F7]">
          <span className="font-bold text-white">
            Honest Proxy Limitation:
          </span>{" "}
          PayPal&apos;s internal underwriting and hold algorithm is proprietary.
          Thaw is an independent early-warning proxy built strictly from
          publicly documented merchant signals, dispute velocity rules, and
          fulfillment requirements. Built for PayPal sellers to prevent surprise
          cash freezes.
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-[#a2b4cc] hover:bg-[#1c346c] hover:text-white transition-colors"
          title="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
