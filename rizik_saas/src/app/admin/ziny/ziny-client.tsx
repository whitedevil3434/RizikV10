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
    <div className="h-screen w-full flex-1 overflow-hidden relative bg-[#171717]">
      {/* 100% Pure Edge-to-Edge Fullscreen Open WebUI */}
      <iframe
        src={ZINY_WEBUI_URL}
        className="w-full h-full border-0 absolute inset-0"
        title="Ziny — Cortex Personal AI"
        allow="microphone; camera; clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
