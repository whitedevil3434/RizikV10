"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { QrCodeIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function AdminQRGenerator() {
    const [batchId, setBatchId] = useState("");
    const [productId, setProductId] = useState("MAT-GLOW-01");
    const [quantity, setQuantity] = useState(100);
    const [generatedQR, setGeneratedQR] = useState<string | null>(null);

    const handleGenerate = () => {
        // In production, this would hit the Supabase backend to insert into `product_qr_tags`
        // For now, we simulate generating a cryptographic hash based on input.
        const mockHash = `RZK-${productId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        setGeneratedQR(`https://rizik.io/verify/${mockHash}`);
    };

    return (
        <div className="w-full flex h-screen bg-[#F5F2EB]">
            {/* Sidebar - Internal ERP */}
            <aside className="w-64 bg-[#031E49] text-white flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <span className="font-bold text-xl tracking-tight text-[#F5F2EB]">Rizik<span className="text-[#00B16A]">ERP</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">Command Center</a>
                    <a href="/admin/orders" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">Logistics & Orders</a>
                    <a href="/admin/crm" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">Support CRM</a>
                    <a href="/admin/qr" className="block px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold shadow-inner">QR Production Tags</a>
                </nav>
            </aside>

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto p-12">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-[#031E49] mb-2">Production QR Generation</h1>
                        <p className="text-[#0A2D6C]/70">Securely generate and link QR codes to physical manufacturing batches.</p>
                    </div>
                    <button className="bg-[#00B16A] hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm">
                        <PlusIcon className="w-5 h-5" />
                        New Batch Request
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Generation Form */}
                    <section className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-[#031E49] mb-6">Tag Parameters</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-[#031E49] mb-1">Target Product</label>
                                <select
                                    className="w-full border border-[#031E49]/20 rounded-lg px-4 py-2.5 bg-[#F5F2EB] text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#00B16A]"
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                >
                                    <option value="MAT-GLOW-01">Eco-Mat: Glow Series</option>
                                    <option value="BIO-RETORT-V1">Bio-Shield: 1yr Retort Pouch</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#031E49] mb-1">Production Batch ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BATCH-2026-A1"
                                    className="w-full border border-[#031E49]/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00B16A]"
                                    value={batchId}
                                    onChange={(e) => setBatchId(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#031E49] mb-1">Quantity to Generate</label>
                                <input
                                    type="number"
                                    className="w-full border border-[#031E49]/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00B16A]"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                                <p className="text-xs text-[#0A2D6C]/60 mt-1">Will generate unique sequential tags linked to this batch.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="mt-8 w-full bg-[#031E49] hover:bg-[#0A2D6C] text-white py-3 rounded-lg font-bold shadow-md transition-colors"
                        >
                            Generate Cryptographic Hash
                        </button>
                    </section>

                    {/* Preview Panel */}
                    <section className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                        {generatedQR ? (
                            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                                <div className="bg-white p-4 rounded-xl border-4 border-[#031E49] shadow-lg mb-6">
                                    <QRCodeSVG
                                        value={generatedQR}
                                        size={200}
                                        fgColor="#031E49"
                                        imageSettings={{
                                            src: "/rizik-logo.svg",
                                            x: undefined,
                                            y: undefined,
                                            height: 48,
                                            width: 48,
                                            excavate: true,
                                        }}
                                    />
                                </div>
                                <h3 className="font-bold text-[#00B16A] text-xl mb-1">Tag Successfully Generated</h3>
                                <p className="text-sm text-[#0A2D6C] max-w-xs break-all border border-[#031E49]/10 bg-[#F5F2EB] px-3 py-2 rounded-md mt-2">
                                    {generatedQR}
                                </p>
                                <div className="mt-6 flex gap-3 w-full">
                                    <button className="flex-1 bg-white border-2 border-[#031E49] text-[#031E49] py-2 rounded-lg font-bold hover:bg-[#F5F2EB] transition-colors">
                                        Print Label (SVG)
                                    </button>
                                    <button className="flex-1 bg-[#031E49] text-white py-2 rounded-lg font-bold hover:bg-[#0A2D6C] transition-colors">
                                        Save to Database
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-[#031E49]/30">
                                <QrCodeIcon className="w-24 h-24 mb-4" />
                                <p className="font-medium text-lg text-[#031E49]/60">Awaiting Batch Input</p>
                            </div>
                        )}
                    </section>
                </div>

            </main>
        </div>
    );
}
