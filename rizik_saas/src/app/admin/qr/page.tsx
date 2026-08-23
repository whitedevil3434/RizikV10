"use client";

import { useState } from "react";
import { PlusIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";
import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

export default function AdminQRGenerator() {
  const [batchId, setBatchId] = useState("");
  const [productId, setProductId] = useState("TEXTILE-BATCH-01");
  const [quantity, setQuantity] = useState(200);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<"VERIFY" | "FAIR">("VERIFY");

  const handleGenerate = () => {
    const tagCode = `RZK-${productId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://rizik.global";
    const url = entryMode === "FAIR"
      ? `${origin}/fair?scan=${encodeURIComponent(tagCode)}`
      : `${origin}/verify/${tagCode}`;
    setGeneratedQR(url);
  };

  return (
    <OpsShell
      title="QR Production Tags"
      subtitle="Generate secure product tags and attach them to batch records for end-to-end traceability."
      activeHref="/admin/qr"
      scopeLabel="Admin ERP"
      roleLabel="Traceability Desk"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/qr", label: "Generate", tone: "neutral" },
        { href: "/admin/production", label: "Batch Ops", tone: "neutral" },
        { href: "/admin/orders", label: "Dispatch", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#031E49]">Tag Generation</h2>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#00B16A] text-white text-xs font-bold">
              <PlusIcon className="h-4 w-4" />
              New Batch
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Target Product</span>
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              >
                <option value="TEXTILE-BATCH-01">Textile Batch</option>
                <option value="BIO-RETORT-V1">Bio-Shield Retort Pouch</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Batch ID</span>
              <input
                value={batchId}
                onChange={(event) => setBatchId(event.target.value)}
                placeholder="e.g. RB-BATCH-2026-02"
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Tag Quantity</span>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Entry Mode</span>
              <select
                value={entryMode}
                onChange={(event) => setEntryMode(event.target.value as "VERIFY" | "FAIR")}
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              >
                <option value="VERIFY">Product Verification</option>
                <option value="FAIR">Rizik Fair Onboarding</option>
              </select>
            </label>

            <button
              onClick={handleGenerate}
              className="w-full rounded-xl bg-[#031E49] text-white py-3 text-sm font-bold hover:bg-[#0A2D6C]"
            >
              Generate Secure Tag
            </button>
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm min-h-[420px] flex flex-col items-center justify-center">
          {generatedQR ? (
            <>
              <div className="p-4 rounded-2xl border-4 border-[#031E49] bg-white shadow-lg">
                <QRCodeSVG
                  value={generatedQR}
                  size={210}
                  fgColor="#031E49"
                  imageSettings={{
                    src: "/rizik-mark.svg",
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
              </div>
              <p className="mt-5 text-sm font-semibold text-[#00B16A]">Tag link generated successfully</p>
              <p className="mt-2 text-xs text-[#0A2D6C]/70 break-all rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/65 px-3 py-2 max-w-sm text-center">
                {generatedQR}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 w-full max-w-sm">
                <button className="rounded-xl border border-[#031E49]/15 text-[#031E49] text-sm font-semibold py-2.5 hover:bg-[#F5F2EB]">
                  Print SVG
                </button>
                <button className="rounded-xl bg-[#031E49] text-white text-sm font-bold py-2.5 hover:bg-[#0A2D6C]">
                  Save to DB
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-[#031E49]/40">
              <QrCodeIcon className="h-20 w-20" />
              <p className="mt-3 text-sm font-semibold">Awaiting generation input</p>
            </div>
          )}
        </article>
      </section>
    </OpsShell>
  );
}
