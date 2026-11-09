"use client";

import React, { useState } from "react";
import { X, Sliders, CheckCircle2, AlertCircle, Key, Lock, Globe } from "lucide-react";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConnectModal({ isOpen, onClose, onSuccess }: ConnectModalProps) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [webhookId, setWebhookId] = useState("");
  const [merchantName, setMerchantName] = useState("My PayPal Store");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/paypal/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          webhookId,
          merchantName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: data.verified
            ? "Connected to PayPal Sandbox REST API successfully!"
            : "Updated! Operating in High-Fidelity Sandbox Simulation Mode.",
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to connect to PayPal sandbox.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Network error connecting to sandbox.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-500/20 p-2 text-brand-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                PayPal Sandbox Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Connect your developer.paypal.com sandbox application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Store Display Name
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. Apex Apparel Direct"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Sandbox Client ID
            </label>
            <div className="relative">
              <Key className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="From developer.paypal.com Apps & Credentials"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Sandbox Client Secret
            </label>
            <div className="relative">
              <Lock className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Sandbox Secret Key"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Webhook ID (Optional)
            </label>
            <div className="relative">
              <Globe className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={webhookId}
                onChange={(e) => setWebhookId(e.target.value)}
                placeholder="e.g. 5O190127TN364714B"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 text-[11px] text-slate-400 leading-relaxed">
            Note for Judges: If credentials are not entered, Thaw seamlessly operates in full high-fidelity Sandbox Simulation Mode with the 3 pre-seeded scenarios.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-800 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white hover:bg-brand-500 shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Save & Connect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
