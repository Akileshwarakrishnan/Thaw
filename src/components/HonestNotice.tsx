"use client";

import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

export function HonestNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#d4d7dc] bg-white p-4 shadow-[0_0_20px_rgba(27,37,40,0.03)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-[#e5f0ff] p-2 text-[#367eed] shrink-0">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="flex-1 text-xs leading-relaxed text-[#1f2328]">
          <span className="font-bold text-[#1f2328]">
            Honest Proxy Limitation Notice:
          </span>{" "}
          PayPal&apos;s internal risk and underwriting models are proprietary.
          Thaw is an independent intelligent early-warning proxy built strictly from
          publicly documented merchant fulfillment policies, dispute thresholds, and
          reserve rules. Designed for PayPal merchants to prevent sudden cash freezes before they occur.
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 text-[#535963] hover:bg-[#f6f6f6] hover:text-[#1f2328] transition-colors"
          title="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
