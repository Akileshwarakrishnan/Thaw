"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Film,
  Copy,
  Check,
  ExternalLink,
  Volume2,
} from "lucide-react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [activeTab, setActiveTab] = useState<"video" | "teleprompter" | "replace_voice">("video");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentVideoSrc = "/thaw-demo-video.mp4";
  const ffmpegCommand = `ffmpeg -i public/thaw-demo-video.mp4 -i my_voice.mp3 -c:v copy -map 0:v:0 -map 1:a:0 -shortest public/thaw-demo-video-myvoice.mp4`;

  const copyCommand = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-[12px] border border-[#d4d7dc] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4d7dc] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-[#1f2328] p-2 text-white">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1f2328]">
                Official Product Demo Video (1080p Full HD)
              </h3>
              <p className="text-xs text-[#535963]">
                Zero-overlap broadcast presentation featuring live UI telemetry, human approval gate, and South Indian voiceover
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#535963] hover:bg-[#f6f6f6] hover:text-[#1f2328] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#d4d7dc] pb-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("video")}
              className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                activeTab === "video"
                  ? "bg-[#1f2328] text-white shadow-xs"
                  : "bg-[#f6f6f6] text-[#535963] hover:text-[#1f2328]"
              }`}
            >
              Watch Video
            </button>
            <button
              onClick={() => setActiveTab("teleprompter")}
              className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                activeTab === "teleprompter"
                  ? "bg-[#1f2328] text-white shadow-xs"
                  : "bg-[#f6f6f6] text-[#535963] hover:text-[#1f2328]"
              }`}
            >
              Teleprompter Script
            </button>
            <button
              onClick={() => setActiveTab("replace_voice")}
              className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                activeTab === "replace_voice"
                  ? "bg-[#1f2328] text-white shadow-xs"
                  : "bg-[#f6f6f6] text-[#535963] hover:text-[#1f2328]"
              }`}
            >
              Swap with My Voice
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#535963] bg-[#f6f6f6] px-3 py-1 rounded-full border border-[#d4d7dc]">
              <Volume2 className="h-3.5 w-3.5 text-[#367eed]" />
              South Indian English Narration
            </span>

            <a
              href="/thaw-demo-video.mp4"
              download="thaw-demo-video.mp4"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 font-bold text-xs shadow-xs transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Download MP4 (6.6 MB)
            </a>
          </div>
        </div>

        {/* TAB 1: Video Player */}
        {activeTab === "video" && (
          <div className="space-y-4">
            <div className="relative rounded-[10px] overflow-hidden bg-black aspect-video shadow-md border border-[#d4d7dc]">
              <video
                key={currentVideoSrc}
                controls
                autoPlay
                className="w-full h-full object-contain"
                src={currentVideoSrc}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[10px] bg-[#f6f6f6] p-3 text-xs border border-[#d4d7dc]">
              <div className="space-y-0.5 text-[#535963]">
                <span className="font-bold text-[#1f2328]">Narration:</span> South Indian English Voiceover · 1920x1080 (1080p Full HD), 25fps, AAC audio.
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentVideoSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#367eed] hover:underline flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Teleprompter Script */}
        {activeTab === "teleprompter" && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
            <div className="rounded-[8px] bg-[#e5f0ff] p-3 border border-[#accfff] text-[#1b63d2] font-semibold">
              Script formatted with full words for crystal-clear judge delivery. Spoken at ~125 words per minute.
            </div>

            {[
              {
                scene: "Scene 1: The Problem & The Surprise Cash Freeze",
                script:
                  "Every single month, thousands of profitable e-commerce merchants wake up to a devastating email from PayPal: Your account has been placed on a twenty-one day hold, or a rolling reserve. In an instant, incoming revenue is frozen. Merchants cannot pay suppliers, and payroll is paralyzed. Worst of all, PayPal risk algorithms never disclose why until it is already too late. This is Thaw: the early-warning and cash-flow shield built specifically for PayPal sellers. Our promise is simple: Know before PayPal freezes your money.",
              },
              {
                scene: "Scene 2: Live Hold Risk Gauge & Cash-Flow Shield",
                script:
                  "Instead of leaving merchants in the dark, Thaw continuously analyzes seller account telemetry across six publicly documented underwriting triggers. In this live store, our Hold Risk Gauge is sitting at sixty-three out of one hundred, in the Medium Risk drifting band. Down in the Cash-Flow Shield, Thaw immediately reveals the financial reality: out of five thousand four hundred dollars in sales, exactly three hundred and three dollars is vulnerable to a ten percent rolling reserve, locked for up to twenty-one days by PayPals automated risk bots.",
              },
              {
                scene: "Scene 3: AI Root-Cause Diagnosis & Weighted Action Queue",
                script:
                  "Why is this account drifting? Thaw's AI engine analyzes the deterministic risk signals and breaks them down into plain, actionable English: Fourteen physical orders dispatched over three days ago are completely missing carrier tracking numbers, and customer dispute rates are trending upward toward the critical one point five percent threshold. In the Action Queue, our agent proposes ranked, prioritized solutions. Notice the Weight Impact Badge: fulfilling this action removes six risk points directly from the missing tracking trigger upon dispatch.",
              },
              {
                scene: "Scene 4: The Hero Moment — Human Approval-Gated Dispatch",
                script:
                  "Now, here is our core philosophy: Strict Human-in-the-Loop Guardrails. The AI proposes actions, but zero money and zero tracking moves without explicit merchant approval. When the merchant clicks Approve and Execute, the remediation is dispatched instantly through the PayPal Agent Toolkit using Model Context Protocol tools. Carrier tracking is submitted directly to PayPals live Shipment Tracking API. Immediately, our risk engine re-evaluates: the risk score drops by six points, the cash-flow shield updates, and held funds are cleared for withdrawal.",
              },
              {
                scene: "Scene 5: Proactive Defense & 5-Step Sandbox Proof",
                script:
                  "Merchants can also hedge against future risk. With our Pre-Promotion Simulator, sellers planning a flash sale can simulate a two point five times volume spike and generate pre-notification documentation for PayPal underwriting to prevent automated velocity freezes. And everything you see is real. In our Sandbox Proof suite, Thaw executes an authentic five-step verification cycle across PayPals live REST APIs: creating real orders, uploading real shipment trackers, executing refunds, reading disputes, and cryptographically verifying webhook signatures.",
              },
              {
                scene: "Scene 6: Enterprise Architecture & Production Safety",
                script:
                  "Under the hood, Thaw is built on Next.js fourteen, TypeScript, Prisma, and Zod schema validation, backed by twenty-one automated unit tests with strict idempotency and refund cap safeguards. PayPal protects buyers. Thaw protects merchants. Know before PayPal freezes your money. Thank you.",
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="rounded-[8px] border border-[#d4d7dc] p-3.5 space-y-2 bg-[#f6f6f6]"
              >
                <div className="font-bold text-[#1f2328] text-sm">{s.scene}</div>
                <p className="text-[#535963] leading-relaxed text-xs">{s.script}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Swap Voice with Personal Recording */}
        {activeTab === "replace_voice" && (
          <div className="space-y-4 text-xs">
            <div className="rounded-[8px] bg-[#f6f6f6] p-4 border border-[#d4d7dc] space-y-3">
              <h4 className="font-bold text-[#1f2328] text-sm">
                Record with Your Own Microphone
              </h4>
              <p className="text-[#535963] leading-relaxed">
                If you prefer speaking directly with your own live voice, record yourself reading the script in the Teleprompter tab and save the audio as <code className="bg-white px-1.5 py-0.5 rounded border border-[#d4d7dc] font-mono text-[#1f2328]">my_voice.mp3</code> in your THAW folder.
              </p>
              <div className="space-y-1.5">
                <span className="font-bold text-[#1f2328]">Run this 1-line command in PowerShell:</span>
                <div className="flex items-center gap-2 bg-[#1f2328] text-white p-3 rounded-[6px] font-mono text-[11px] overflow-x-auto">
                  <span className="flex-1">{ffmpegCommand}</span>
                  <button
                    onClick={copyCommand}
                    className="p-1 hover:bg-[#343941] rounded transition-colors text-white shrink-0"
                    title="Copy command"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
