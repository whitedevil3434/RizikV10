"use client";

import { useState, useEffect } from "react";

// Permanent Cloudflare Named Tunnel URLs
const ZINY_WEBUI_URL =
  process.env.NEXT_PUBLIC_ZINY_URL ?? "https://ziny.rizikecosystem.com";
const CORTEX_API_URL =
  process.env.NEXT_PUBLIC_CORTEX_API_URL ?? "https://ziny-api.rizikecosystem.com";

type Status = "checking" | "online" | "offline";

export default function ZinyClient() {
  const [cortexStatus, setCortexStatus] = useState<Status>("checking");
  const [webuiStatus, setWebuiStatus] = useState<Status>("checking");

  // Live health monitoring
  useEffect(() => {
    const checkCortex = async () => {
      try {
        const res = await fetch(`${CORTEX_API_URL}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        setCortexStatus(res.ok ? "online" : "offline");
      } catch {
        setCortexStatus("offline");
      }
    };

    const checkWebUI = async () => {
      try {
        await fetch(ZINY_WEBUI_URL, {
          signal: AbortSignal.timeout(4000),
          mode: "no-cors",
        });
        setWebuiStatus("online");
      } catch {
        setWebuiStatus("offline");
      }
    };

    void checkCortex();
    void checkWebUI();

    const timer = setInterval(() => {
      void checkCortex();
      void checkWebUI();
    }, 30_000);

    return () => clearInterval(timer);
  }, []);

  const statusDot = (status: Status) => {
    if (status === "checking") return "bg-yellow-400 animate-pulse";
    if (status === "online") return "bg-emerald-500";
    return "bg-red-500";
  };

  const statusLabel = (status: Status) => {
    if (status === "checking") return "Checking…";
    if (status === "online") return "Online";
    return "Offline";
  };

  return (
    <div className="flex flex-col h-full w-full flex-1 overflow-hidden">
      {/* Sleek Minimal Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-[#031E49]/10 text-xs shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${statusDot(cortexStatus)}`} />
            <span className="text-[#031E49]/70 font-medium">
              Cortex SNN API: {statusLabel(cortexStatus)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${statusDot(webuiStatus)}`} />
            <span className="text-[#031E49]/70 font-medium">
              Open WebUI: {statusLabel(webuiStatus)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
            🧠 Gemma SNN Active
          </span>
          <span className="hidden sm:inline text-[11px] text-[#031E49]/50">
            100% Private · Local Memory
          </span>
        </div>
      </div>

      {/* Edge-to-Edge Open WebUI iframe */}
      <div className="flex-1 w-full h-full bg-white relative overflow-hidden">
        <iframe
          src={ZINY_WEBUI_URL}
          className="w-full h-full border-0 absolute inset-0"
          title="Ziny — Cortex Personal AI"
          allow="microphone; camera; clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
