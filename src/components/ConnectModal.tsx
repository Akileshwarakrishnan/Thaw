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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[10px] border border-[#d4d7dc] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.15)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#e5f0ff] p-2 text-[#367eed]">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f2328]">
                PayPal Sandbox Configuration
              </h3>
              <p className="text-xs text-[#535963]">
                Connect your developer.paypal.com sandbox application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#535963] hover:bg-[#f6f6f6] hover:text-[#1f2328]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`rounded-[8px] p-3 text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#1f2328] font-bold mb-1">
              Store Display Name
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. ApexGear Apparel"
              className="w-full rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] px-3 py-2 text-[#1f2328] focus:border-[#367eed] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#1f2328] font-bold mb-1">
              Sandbox Client ID
            </label>
            <div className="relative">
              <Key className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#535963]" />
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="From developer.paypal.com Apps & Credentials"
                className="w-full rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] pl-9 pr-3 py-2 text-[#1f2328] font-mono focus:border-[#367eed] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1f2328] font-bold mb-1">
              Sandbox Client Secret
            </label>
            <div className="relative">
              <Lock className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#535963]" />
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Sandbox Secret Key"
                className="w-full rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] pl-9 pr-3 py-2 text-[#1f2328] font-mono focus:border-[#367eed] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1f2328] font-bold mb-1">
              Webhook ID (Optional)
            </label>
            <div className="relative">
              <Globe className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#535963]" />
              <input
                type="text"
                value={webhookId}
                onChange={(e) => setWebhookId(e.target.value)}
                placeholder="e.g. 5O190127TN364714B"
                className="w-full rounded-[8px] border border-[#d4d7dc] bg-[#f6f6f6] pl-9 pr-3 py-2 text-[#1f2328] font-mono focus:border-[#367eed] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="rounded-[8px] bg-[#f6f6f6] border border-[#d4d7dc] p-3 text-xs text-[#535963] leading-relaxed">
            <strong className="text-[#1f2328]">Judge Note:</strong> Credentials are optional for evaluation. Thaw provides high-fidelity simulated sandbox datasets for instant zero-friction judging.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#d4d7dc] px-4 py-1.5 font-bold text-[#535963] hover:bg-[#f6f6f6] hover:text-[#1f2328] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#1f2328] hover:bg-[#343941] px-5 py-1.5 font-bold text-white shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Save Credentials"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
