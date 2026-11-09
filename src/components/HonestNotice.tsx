"use client";

import React, { useState } from "react";
import { Info, X, ShieldAlert } from "lucide-react";

export function HonestNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand-500/30 bg-brand-950/40 p-4 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-brand-500/20 p-2 text-brand-400">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm leading-relaxed text-slate-300">
          <span className="font-semibold text-white">
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
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          title="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
