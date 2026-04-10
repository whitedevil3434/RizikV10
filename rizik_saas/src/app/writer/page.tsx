"use client";

import React, { useState, useEffect } from "react";
import { 
  Mic, FileText, Sparkles, ShieldCheck, ArrowRight, Activity, 
  Fingerprint, Download, ShieldAlert, Zap, Globe, Lock, ChevronDown, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { canAccessAdminRole } from "@/lib/auth/policy";
import "./writer.css";

function resolveBackendUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://rizik-backend-godly.its-sabbir69.workers.dev"
  );
}

function generateDigitalOrderCode(): string {
  return `RZK-DIG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

const CREDIT_PACKAGES = [
  { credits: 7, priceBdt: 45 },
  { credits: 3, priceBdt: 20 },
  { credits: 1, priceBdt: 7 },
] as const;
const CHAOS_BOOST_MULTIPLIER = 2.0;
const HUMAN_ERROR_BOOST_MULTIPLIER = 1.75;

function isExpiredSessionResponse(res: Response, body: any): boolean {
  if (res.status !== 401) return false;
  const message = String(body?.error || body?.message || body?.detail || "").toLowerCase();
  return message.includes("expired") || message.includes("invalid");
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function WriterPage() {
  const [inputType, setInputType] = useState<"text" | "voice">("text");
  const [referenceText, setReferenceText] = useState("");
  const [aiText, setAiText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [pipelineText, setPipelineText] = useState("");
  const [viewMode, setViewMode] = useState<"llm" | "pipeline">("pipeline");
  const [isRecording, setIsRecording] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [dnaProfile, setDnaProfile] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<number>(CREDIT_PACKAGES[0].credits);
  const [trxId, setTrxId] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Chaos Engine State
  const [useHumanConsortium, setUseHumanConsortium] = useState(true);
  const [chaosLevel, setChaosLevel] = useState(0.8);
  const [isAcademic, setIsAcademic] = useState(false);
  const [dnaMatching, setDnaMatching] = useState(false);

  // Human Error Chaos State (0-100)
  const [humanErrorLevel, setHumanErrorLevel] = useState(0);

  // Voice Pipeline State
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceChunks, setVoiceChunks] = useState<Blob[]>([]);
  const [voiceTranscribedText, setVoiceTranscribedText] = useState("");
  
  // UI Error State (replaces browser alerts)
  const [errorMsg, setErrorMsg] = useState("");
  const [showDnaDetails, setShowDnaDetails] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [packageUnits, setPackageUnits] = useState<Record<number, number>>(
    Object.fromEntries(CREDIT_PACKAGES.map((pkg) => [pkg.credits, 1])),
  );
  const selectedPackage = CREDIT_PACKAGES.find((p) => p.credits === selectedCreditPackage) || CREDIT_PACKAGES[0];
  const selectedUnits = packageUnits[selectedPackage.credits] || 1;
  const selectedTotalCredits = selectedPackage.credits * selectedUnits;
  const selectedTotalPrice = selectedPackage.priceBdt * selectedUnits;
  const effectiveChaosLevel = Math.min(1, chaosLevel * CHAOS_BOOST_MULTIPLIER);
  const effectiveHumanErrorLevel = Math.min(100, Math.round(humanErrorLevel * HUMAN_ERROR_BOOST_MULTIPLIER));

  const adjustPackageUnits = (packageCredits: number, delta: number) => {
    setPackageUnits((prev) => {
      const current = prev[packageCredits] || 1;
      const next = Math.max(1, current + delta);
      return {
        ...prev,
        [packageCredits]: next,
      };
    });
  };

  const hasDnaProfile = Boolean(dnaProfile);
  const hasOutput = Boolean(outputText.trim() || pipelineText.trim());

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Fetch profile for role check
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profile && canAccessAdminRole(profile.role)) {
      setIsAdmin(true);
    }

    const { data } = await supabase
      .from('user_usage')
      .select('free_uses_remaining, paid_credits')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      const freeUses = Number((data as any).free_uses_remaining || 0);
      const paid = Number((data as any).paid_credits || 0);
      setCredits(freeUses + paid);
    }
  };

  const getFreshAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;

    const { data: refreshData } = await supabase.auth.refreshSession();
    return refreshData.session?.access_token || null;
  };

  const ghostFetch = async (
    path: string,
    init: RequestInit,
    timeoutMs: number
  ): Promise<Response | null> => {
    const firstToken = await getFreshAccessToken();
    if (!firstToken) {
      setErrorMsg("Session expired. Please sign in again.");
      return null;
    }

    const run = async (token: string) =>
      fetchWithTimeout(`${resolveBackendUrl()}${path}`, {
        ...init,
        headers: {
          ...(init.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      }, timeoutMs);

    let res = await run(firstToken);
    if (res.status !== 401) return res;

    const body = await res.clone().json().catch(() => null);
    if (!isExpiredSessionResponse(res, body)) return res;

    const refreshedToken = await getFreshAccessToken();
    if (!refreshedToken || refreshedToken === firstToken) return res;
    return run(refreshedToken);
  };

  const handleManualOrder = async () => {
    setIsSubmittingOrder(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('rizik_order_records')
      .insert({
        order_code: generateDigitalOrderCode(),
        customer_name: user.email || "Writer User",
        channel: "DIGITAL",
        product_sku: "WRITER_CREDITS",
        quantity: selectedTotalCredits,
        unit_price_bdt: Number((selectedTotalPrice / selectedTotalCredits).toFixed(2)),
        trxid: trxId,
        status: "PENDING",
        sla_state: "ON_TRACK",
        user_id: user.id,
      });

    if (!error) {
      alert("Order submitted! Credits will be added after verification.");
      setIsBuyModalOpen(false);
      setTrxId("");
    } else {
      alert("Error submitting order: " + error.message);
    }
    setIsSubmittingOrder(false);
  };

  const handleExtractDNA = async () => {
    setIsExtracting(true);
    setErrorMsg("");
    try {
      const res = await ghostFetch("/api/ghost/dna", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: referenceText }),
      }, 25000);
      if (!res) return;
      const data = await res.json();
      if (res.ok && data.success) {
        setDnaProfile(data.dna);
      } else {
        setErrorMsg("DNA extraction failed: " + (data?.message || data?.error || "Please sign in again."));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("DNA extraction failed (Network Error). Please try again later.");
    } finally {
      setIsExtracting(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await handleUploadVoice(audioBlob);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording Error:", err);
      alert("Microphone access denied or error occurred.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleUploadVoice = async (blob: Blob) => {
    setIsExtracting(true);
    setErrorMsg("");
    try {
      const res = await ghostFetch("/api/ghost/dna/voice", {
        method: "POST",
        headers: {},
        body: blob
      }, 60000);
      if (!res) return;

      const data = await res.json();
      if (res.ok && data.success) {
        setDnaProfile(data.dna);
        setVoiceTranscribedText(data.transcription);
        setReferenceText(data.transcription); // Pre-fill reference text
        alert("Voice DNA Mapped! Linguistic signature locked.");
      } else {
        alert(data.error || "Voice analysis failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTransform = async () => {
    if (!isAdmin && credits <= 0) {
      setIsBuyModalOpen(true);
      return;
    }

    setIsHumanizing(true);
    setDnaMatching(true);
    setErrorMsg("");
    
    try {
      const res = await ghostFetch("/api/ghost/humanize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          aiText: aiText, 
          dnaProfile: dnaProfile,
          options: { 
            academic: isAcademic,
            chaosLevel: effectiveChaosLevel,
            useConsortium: useHumanConsortium,
            humanErrorThreshold: effectiveHumanErrorLevel
          }
        }),
      }, 120000);
      if (!res) return;
      const data = await res.json();
      if (res.ok && data.success) {
        setOutputText(data.content || "");
        setPipelineText(data.pipelineOutput || "");
        // Default render target is always pipeline output.
        setViewMode("pipeline");
        fetchUsage(); // Refresh credits
      } else {
        setErrorMsg(data?.message || data?.error || "Humanizer failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      if (e instanceof DOMException && e.name === "AbortError") {
        setErrorMsg("Humanize process took longer than expected. Please retry. No credit is deducted unless output is successfully generated.");
      } else {
        setErrorMsg("Transformation failed. Check your network and retry. No credit is deducted unless output is successfully generated.");
      }
    } finally {
      setIsHumanizing(false);
      setDnaMatching(false);
    }
  };

  const getCurrentOutput = (): string => {
    return (viewMode === "llm" ? outputText : pipelineText).trim();
  };

  const handleCopyText = async () => {
    const textToCopy = getCurrentOutput();
    if (!textToCopy) {
      setErrorMsg("No output available to copy yet. Generate output first.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 1800);
        return;
      }
    } catch (err) {
      console.warn("Clipboard API failed, falling back to manual copy:", err);
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (!ok) {
        throw new Error("copy command failed");
      }
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1800);
    } catch (err) {
      console.error(err);
      setErrorMsg("Copy failed in this browser context. Please copy manually.");
    }
  };

  const handleExportDocx = async () => {
    const textToExport = getCurrentOutput();
    if (!textToExport) {
      setErrorMsg("No output available to export yet. Generate output first.");
      return;
    }

    try {
      setIsExportingDocx(true);
      setExportDone(false);
      const [{ Document, Packer, Paragraph, TextRun }, fileSaverModule] = await Promise.all([
        import("docx"),
        import("file-saver"),
      ]);

      const lines = textToExport.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const paragraphs = lines.map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line })],
            spacing: { after: 220 },
          }),
      );

      const doc = new Document({
        sections: [
          {
            children: paragraphs.length > 0 ? paragraphs : [new Paragraph(textToExport)],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `rizik-writer-output-${stamp}.docx`;

      const maybeSaveAs =
        (fileSaverModule as { saveAs?: ((blob: Blob, name: string) => void); default?: unknown }).saveAs ||
        (typeof (fileSaverModule as { default?: unknown }).default === "function"
          ? (fileSaverModule as { default: (blob: Blob, name: string) => void }).default
          : undefined) ||
        (fileSaverModule as { default?: { saveAs?: (blob: Blob, name: string) => void } }).default?.saveAs;

      if (typeof maybeSaveAs === "function") {
        maybeSaveAs(blob, filename);
        setExportDone(true);
        setTimeout(() => setExportDone(false), 2200);
        return;
      }

      // Browser-native fallback in case bundler/module interop shape changes.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2200);
    } catch (err) {
      console.error(err);
      setErrorMsg("DOCX export failed. Please try again.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="writer-page !bg-[#F5F2EB] !text-[#04204C]">
      <div className="wr-container py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#04204C]">
              RIZIK <span className="text-[#00B16A]">WRITER</span>
            </h1>
            <p className="text-[#04204C]/50 font-bold uppercase tracking-widest text-xs italic">Chaos Engine v3.3</p>
          </div>

          <div 
            className="credit-pill glass-panel !py-2 !px-4 hover:scale-105 transition-transform cursor-pointer !bg-white !shadow-sm"
            onClick={() => setIsBuyModalOpen(true)}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#00B16A] animate-pulse"></div>
            <span className={`text-sm font-black tracking-wider ${isAdmin ? "text-[#00B16A]" : "text-[#04204C]"}`}>
              {isAdmin ? "∞ UNLIMITED" : `${credits} CREDITS`}
            </span>
            <button type="button" className="ml-2 text-[10px] bg-[#04204C] text-white px-2 py-0.5 rounded font-black uppercase">
              Top Up
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between text-red-500 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-bold flex items-center gap-2">
              <ShieldAlert size={16} />
              {errorMsg}
            </span>
            <button onClick={() => setErrorMsg("")} className="text-red-500/50 hover:text-red-500">×</button>
          </div>
        )}

        {/* DNA Matching Indicator */}
        {dnaMatching && (
          <div className="mb-8 glass-panel !py-4 border-[#00B16A]/30 flex items-center gap-4 animate-pulse !bg-white">
            <Activity className="text-[#00B16A]" size={24} />
            <div className="flex-1">
              <div className="text-xs uppercase font-black text-[#00B16A] mb-1">Human DNA Consortium matching...</div>
              <div className="w-full bg-[#04204C]/5 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[#00B16A] animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#00B16A]/70 uppercase font-black">Sync: 98.4%</div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div className="space-y-8">
            <div className="glass-panel space-y-8 animate-in fade-in zoom-in-95 duration-500 !bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black mb-1 text-[#04204C]">Human DNA Extraction</h2>
                  <p className="text-[#04204C]/40 text-sm font-medium">Provide your writing signature to bypass high-grade detectors.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setInputType('text')} className={`p-2.5 rounded-xl transition-all ${inputType === 'text' ? 'bg-[#04204C] text-white' : 'bg-[#F5F2EB] text-[#04204C]/40'}`}><FileText size={20}/></button>
                  <button onClick={() => setInputType('voice')} className={`p-2.5 rounded-xl transition-all ${inputType === 'voice' ? 'bg-[#04204C] text-white' : 'bg-[#F5F2EB] text-[#04204C]/40'}`}><Mic size={20}/></button>
                </div>
              </div>

              {inputType === 'text' ? (
                <textarea
                  className="input-field min-h-[250px] !bg-[#F9F7F2] !border-[#04204C]/10"
                  placeholder="Paste your past essays, chat logs, or any genuine writing here..."
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                />
              ) : (
                <div className="glass-card flex flex-col items-center justify-center p-12 border-dashed border-[#04204C]/10 bg-[#F9F7F2]">
                   {isRecording ? (
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                          <Mic size={32} className="text-red-500" />
                        </div>
                        <p className="text-[#04204C]/60 font-black text-sm uppercase tracking-widest">Recording DNA Sample...</p>
                        <button 
                          type="button"
                          onClick={stopVoiceRecording}
                          className="btn btn-secondary border-red-500/20 text-red-500 hover:bg-red-500/5 px-8"
                        >
                          STOP RECORDING
                        </button>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-6">
                        <Mic size={48} className="text-[#04204C]/10" />
                        <div className="text-center">
                          <p className="text-[#04204C]/60 font-black text-sm uppercase mb-1">Human Voice Extraction</p>
                          <p className="text-[#04204C]/30 text-xs font-medium max-w-[240px]">Read a 30-sec natural text for high-fidelity DNA mapping. Whisper v3 will capture your unique rhythm.</p>
                        </div>
                        <button 
                          type="button"
                          onClick={startVoiceRecording}
                          className="btn btn-primary bg-[#04204C] hover:bg-[#04204C]/90 px-8 disabled:opacity-50"
                          disabled={isExtracting}
                        >
                          {isExtracting ? 'ANALYZING VOICE...' : 'START RECORDING'}
                        </button>
                        {voiceTranscribedText && (
                          <div className="mt-4 p-4 bg-white/50 rounded-xl border border-dashed border-[#04204C]/5 text-[10px] text-[#04204C]/40 italic max-w-sm">
                            Captured: "{voiceTranscribedText.slice(0, 80)}..."
                          </div>
                        )}
                     </div>
                   )}
                </div>
              )}

              <button 
                type="button"
                className="btn btn-primary w-full h-16 text-sm tracking-[0.2em] font-black"
                disabled={!referenceText || isExtracting}
                onClick={handleExtractDNA}
              >
                {isExtracting ? 'SCANNING LINGUISTIC SIGNATURE...' : 'ANALYZE WRITING DNA'}
              </button>

              {hasDnaProfile && (
                <div className="rounded-2xl border border-[#04204C]/10 bg-[#F9F7F2] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDnaDetails((prev) => !prev)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                    aria-expanded={showDnaDetails}
                  >
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#04204C]/70">DNA Extraction Details</p>
                      <p className="text-[11px] text-[#04204C]/45">Click to view what was extracted from your input.</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-[#04204C]/60 transition-transform ${showDnaDetails ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showDnaDetails && (
                    <div className="border-t border-[#04204C]/10 px-4 py-3 space-y-2 text-xs text-[#04204C]/80">
                      <div>
                        <span className="font-black text-[#04204C]">Top words:</span>{" "}
                        {(dnaProfile?.lexical?.topWords || []).slice(0, 5).join(", ") || "N/A"}
                      </div>
                      <div>
                        <span className="font-black text-[#04204C]">Avg sentence length:</span>{" "}
                        {Number(dnaProfile?.syntactic?.avgLength || 0).toFixed(1)} words
                      </div>
                      <div>
                        <span className="font-black text-[#04204C]">Writing flow:</span>{" "}
                        {dnaProfile?.rhythmic?.flow || "N/A"} | Burstiness {Number(dnaProfile?.rhythmic?.burstiness || 0).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-black text-[#04204C]">Punctuation profile:</span>{" "}
                        commas {Number(dnaProfile?.punctuation?.commas || 0).toFixed(3)}, dashes {Number(dnaProfile?.punctuation?.dashes || 0)}
                      </div>
                      <div>
                        <span className="font-black text-[#04204C]">Detected error tendency:</span>{" "}
                        factor {Number(dnaProfile?.errorFingerprint?.error_factor || 0).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-black text-[#04204C]">Structure:</span>{" "}
                        {Number(dnaProfile?.structural?.paraCount || 0)} paragraphs,{" "}
                        {Number(dnaProfile?.structural?.sentPerPara || 0).toFixed(1)} sentences/paragraph
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="glass-panel space-y-8 animate-in fade-in zoom-in-95 duration-500 !bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black mb-1 text-[#04204C]">Chaos Engine Initialization</h2>
                    <p className="text-[#04204C]/40 text-sm font-medium">Paste AI text and configure the injection level.</p>
                  </div>
                  <div className={`status-pill !border-[#00B16A]/20 ${dnaProfile ? "!bg-[#00B16A]/10 !text-[#00B16A]" : "!bg-[#04204C]/5 !text-[#04204C]/40"}`}>
                    {dnaProfile ? "DNA_LOADED" : "DNA_PENDING"}
                  </div>
                </div>

                <textarea
                  className="input-field min-h-[300px] !bg-[#F9F7F2] !border-[#04204C]/10"
                  placeholder="Paste your AI generated text here..."
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAiText("")}
                    className="btn btn-secondary !h-10 !px-4 text-[11px] tracking-widest font-black"
                    disabled={!aiText}
                  >
                    DELETE PASTED TEXT
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-[#04204C]/30 tracking-widest ml-1">
                      Chaos Level
                      {humanErrorLevel > 0 && <span className="text-[#E2136E] ml-1">● ACTIVE</span>}
                    </label>
                    <div className={`bg-[#F9F7F2] p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                      humanErrorLevel > 0 ? 'border-[#E2136E]/30 bg-[#E2136E]/5' : 'border-[#04204C]/5'
                    }`}>
                      <input 
                        type="range" min="0" max="100" step="5" 
                        value={humanErrorLevel} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setHumanErrorLevel(val);
                          setChaosLevel(val > 0 ? (val / 100) : 0.8);
                        }}
                        className="flex-1 accent-[#E2136E]"
                      />
                      <span className={`font-mono font-black ${humanErrorLevel > 0 ? 'text-[#E2136E]' : 'text-[#04204C]'}`}>{humanErrorLevel}%</span>
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-[#04204C]/30 tracking-widest ml-1">Knowledge Source</label>
                    <button 
                      type="button"
                      onClick={() => {
                        const newVal = !isAcademic;
                        setIsAcademic(newVal);
                        setUseHumanConsortium(newVal);
                        if (newVal && humanErrorLevel === 0) {
                           setHumanErrorLevel(35);
                           setChaosLevel(0.35);
                        }
                      }}
                      className={`w-full py-4 rounded-2xl border font-black transition-all flex h-[58px] items-center justify-center gap-3 text-xs tracking-widest ${
                        isAcademic 
                        ? "border-[#00B16A] bg-[#00B16A]/5 text-[#00B16A]" 
                        : "border-[#04204C]/10 bg-[#F9F7F2] text-[#04204C]/30"
                      }`}
                    >
                      {isAcademic ? <Lock size={14}/> : <Globe size={14}/>}
                      {isAcademic ? 'SCHOLARLY CONSORTIUM (ON)' : 'SCHOLARLY CONSORTIUM (OFF)'}
                    </button>
                  </div>
                </div>

                <button 
                  className="btn btn-primary w-full h-16 text-sm tracking-[0.2em]"
                  disabled={!aiText || !dnaProfile || isHumanizing || isExtracting}
                  onClick={handleTransform}
                >
                  {isHumanizing ? 'RECONSTRUCTING COGNITIVE BUBBLES...' : <><Sparkles size={18} className="mr-2"/> GENERATE OUTPUT</>}
                </button>
            </div>
          </div>

           <div className="glass-panel space-y-8 animate-in fade-in zoom-in-95 duration-500 !bg-white lg:sticky lg:top-24">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black mb-1 text-[#04204C]">Humanized Result</h2>
                    <p className="text-[#04204C]/40 text-sm font-medium italic">
                      {hasOutput
                        ? "Generated from your extracted DNA profile and current chaos settings."
                        : hasDnaProfile
                          ? "DNA extracted. Generate output to view final result signals."
                          : "Extract writing DNA first. No detector or match claims are shown before extraction."}
                    </p>
                  </div>
                  
                  {/* View Mode Toggle */}
                  {hasOutput && (
                    <div className="flex bg-[#F9F7F2] p-1 rounded-xl border border-[#04204C]/5">
                      <button 
                        onClick={() => setViewMode("llm")}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                          viewMode === "llm" 
                          ? "bg-[#04204C] text-white shadow-sm" 
                          : "text-[#04204C]/40 hover:text-[#04204C]"
                        }`}
                      >
                        Hybrid LLM Output
                      </button>
                      <button 
                        onClick={() => setViewMode("pipeline")}
                        className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                          viewMode === "pipeline" 
                          ? "bg-[#04204C] text-white shadow-sm" 
                          : "text-[#04204C]/40 hover:text-[#04204C]"
                        }`}
                      >
                        Pure Pipeline Output
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <div className="glass-card !p-2 px-4 flex flex-col items-center !bg-[#04204C]/5 border-none">
                    <span className="text-[10px] text-[#04204C]/40 font-black">TURNITIN</span>
                    <span className={`text-sm font-black ${hasOutput ? "text-[#00B16A]" : "text-[#04204C]/45"}`}>
                      {hasOutput ? "LOW AI SIGNAL" : "PENDING"}
                    </span>
                  </div>
                  <div className="glass-card !p-2 px-4 flex flex-col items-center !bg-[#04204C]/5 border-none">
                    <span className="text-[10px] text-[#04204C]/40 font-black">DNA MATCH</span>
                    <span className={`text-sm font-black ${hasDnaProfile ? "text-[#04204C]" : "text-[#04204C]/45"}`}>
                      {hasDnaProfile ? (hasOutput ? "APPLIED" : "LOADED") : "NOT EXTRACTED"}
                    </span>
                  </div>
                </div>

               <div className="input-field min-h-[400px] !bg-[#F9F7F2] !border-[#04204C]/10 overflow-y-auto whitespace-pre-wrap leading-relaxed text-[#04204C]/80 relative">
                  {!outputText && !pipelineText && !isHumanizing && (
                    <span className="text-[#04204C]/30 italic">Your humanized output will appear here after you run the engine.</span>
                  )}
                  
                  {isHumanizing && (
                    <div className="space-y-4 w-full opacity-50 animate-pulse">
                      <div className="h-4 bg-[#04204C]/10 rounded w-3/4"></div>
                      <div className="h-4 bg-[#04204C]/10 rounded w-full"></div>
                      <div className="h-4 bg-[#04204C]/10 rounded w-5/6"></div>
                      <div className="h-4 bg-[#04204C]/10 rounded w-full"></div>
                      <div className="h-4 bg-[#04204C]/10 rounded w-2/3"></div>
                      <div className="h-4 bg-[#04204C]/10 rounded w-1/2"></div>
                      <div className="mt-8 flex items-center gap-2">
                        <Activity className="animate-spin text-[#00B16A]" size={16}/>
                        <span className="text-xs font-black text-[#04204C]/40 uppercase tracking-widest">Generating Human Output...</span>
                      </div>
                    </div>
                  )}

                  {!isHumanizing && (viewMode === "llm" ? outputText : pipelineText)}
                  
                  {viewMode === "pipeline" && pipelineText && !isHumanizing && (
                    <div className="absolute top-4 right-4 bg-[#00B16A]/10 text-[#00B16A] text-[10px] font-black uppercase px-2 py-1 rounded border border-[#00B16A]/20">
                      100% Non-Generative
                    </div>
                  )}
               </div>

               <div className="flex gap-4">
                  <button 
                    className="btn btn-secondary flex-1 font-black"
                    onClick={handleCopyText}
                  >
                    {copyDone ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Check size={18} /> COPIED
                      </span>
                    ) : (
                      "COPY TEXT"
                    )}
                  </button>
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleExportDocx}
                    disabled={isExportingDocx}
                  >
                    {exportDone ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Check size={18} /> DOWNLOADED
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Download size={18} />
                        {isExportingDocx ? "PREPARING..." : "EXPORT DOCX"}
                      </span>
                    )}
                  </button>
               </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {isBuyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBuyModalOpen(false)}>
          <div className="modal-content glass-panel !bg-white border-[#04204C]/10" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black mb-2 tracking-tight text-[#04204C]">Upgrade Potential</h2>
              <p className="text-[#04204C]/50 font-medium">Used up your credits? Secure more now.</p>
            </div>

            <div className="payment-method-card !bg-[#F9F7F2] border-[#04204C]/5 group cursor-pointer hover:border-[#00B16A]/50 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#E2136E] rounded-2xl flex items-center justify-center font-black text-white text-xs">bk</div>
                  <div>
                    <p className="font-black text-[#04204C]">bKash Send Money</p>
                    <p className="text-[#E2136E] font-black text-sm">01973824423 (Personal)</p>
                  </div>
               </div>
               <ArrowRight className="text-[#04204C]/20 group-hover:text-[#00B16A] transition-colors" />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#04204C]/30 ml-1">Buy Credits</label>
                <div className="space-y-3">
                  {CREDIT_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.credits === pkg.credits;
                    const units = packageUnits[pkg.credits] || 1;
                    const packageTotalCredits = pkg.credits * units;
                    const packageTotalPrice = pkg.priceBdt * units;
                    return (
                      <div
                        key={pkg.credits}
                        className={`input-field w-full !bg-[#F9F7F2] flex items-center justify-between text-left transition-all ${isSelected ? "!border-[#00B16A] shadow-[0_0_0_2px_rgba(0,177,106,0.12)]" : ""}`}
                        onClick={() => setSelectedCreditPackage(pkg.credits)}
                      >
                        <div className="flex-1">
                          <div className="font-black text-xl text-[#04204C]">
                            {packageTotalCredits} Credit{packageTotalCredits > 1 ? "s" : ""}
                          </div>
                          <div className="text-[11px] font-semibold text-[#04204C]/45">
                            Base: {pkg.credits} Credit / {pkg.priceBdt} BDT
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#00B16A] whitespace-nowrap">{packageTotalPrice} BDT</div>
                            <div className="text-[10px] uppercase font-black tracking-wider text-[#04204C]/35">{units}x pack</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              className="h-6 w-6 rounded-md border border-[#04204C]/15 text-[#04204C] text-[11px] font-black leading-none hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                adjustPackageUnits(pkg.credits, 1);
                                setSelectedCreditPackage(pkg.credits);
                              }}
                              aria-label={`Increase ${pkg.credits} credit package`}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="h-6 w-6 rounded-md border border-[#04204C]/15 text-[#04204C] text-[11px] font-black leading-none hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                adjustPackageUnits(pkg.credits, -1);
                                setSelectedCreditPackage(pkg.credits);
                              }}
                              aria-label={`Decrease ${pkg.credits} credit package`}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#00B16A] ml-1">Transaction ID (TRXID)</label>
                <input 
                  type="text" 
                  className="input-field font-mono uppercase tracking-[0.2em] placeholder:tracking-normal !bg-[#F9F7F2]" 
                  placeholder="Paste TRXID here..."
                  value={trxId}
                  onChange={e => setTrxId(e.target.value)}
                />
              </div>

              <button 
                className="btn btn-primary w-full h-16 text-sm tracking-[0.2em]"
                disabled={!trxId || isSubmittingOrder}
                onClick={handleManualOrder}
              >
                {isSubmittingOrder ? 'VERIFYING...' : 'SUMBIT PROOF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
