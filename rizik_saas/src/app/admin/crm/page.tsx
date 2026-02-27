"use client";

import { useState } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline";

export default function AdminCRM() {
    const [activeThread, setActiveThread] = useState<number | null>(1);

    const threads = [
        { id: 1, customer: "Habib Rahman", topic: "Order #RB-8402 Delay", status: "OPEN", latestReq: "Can I get an update on the glow mats? We need them before Friday." },
        { id: 2, customer: "Pran Agro Ltd.", topic: "Bio-Shield MOQ Inquiry", status: "IN_PROGRESS", latestReq: "What is the bulk pricing for 50,000 pouches?" },
        { id: 3, customer: "Dr. Laila", topic: "Retort Tolerance Question", status: "RESOLVED", latestReq: "Thank you, the 121C spec sheet was exactly what we needed." },
    ];

    return (
        <div className="w-full flex h-screen bg-[#F5F2EB]">
            {/* Sidebar - Internal ERP */}
            <aside className="w-64 bg-[#031E49] text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-white/10">
                    <span className="font-bold text-xl tracking-tight text-[#F5F2EB]">Rizik<span className="text-[#00B16A]">ERP</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">Command Center</a>
                    <a href="/admin/orders" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">Logistics & Orders</a>
                    <a href="/admin/crm" className="block px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold shadow-inner">Support CRM</a>
                    <a href="/admin/qr" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium">QR Production Tags</a>
                </nav>
            </aside>

            {/* CRM Main Area */}
            <main className="flex-1 overflow-hidden flex flex-col p-8">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-[#031E49]">Global Support Network</h1>
                    <p className="text-[#0A2D6C]/70">Manage B2B and B2C communications seamlessly.</p>
                </header>

                <div className="flex-1 bg-white rounded-2xl border border-[#031E49]/10 shadow-sm flex overflow-hidden">

                    {/* Thread List */}
                    <div className="w-1/3 border-r border-[#031E49]/10 flex flex-col bg-[#F5F2EB]/30">
                        <div className="p-4 border-b border-[#031E49]/10 flex items-center justify-between bg-white">
                            <h2 className="font-bold text-[#031E49] flex items-center gap-2">
                                <EnvelopeOpenIcon className="w-5 h-5" />
                                Active Tickets
                            </h2>
                            <span className="bg-[#00B16A] text-white text-xs font-bold px-2 py-1 rounded-full">3</span>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {threads.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveThread(t.id)}
                                    className={`w-full text-left p-4 border-b border-[#031E49]/5 hover:bg-white transition-colors ${activeThread === t.id ? 'bg-white border-l-4 border-l-[#031E49]' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-[#031E49] text-sm">{t.customer}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold text-[#0A2D6C] mb-1">{t.topic}</div>
                                    <div className="text-xs text-[#031E49]/50 truncate">{t.latestReq}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Interface */}
                    <div className="flex-1 flex flex-col bg-white">
                        {activeThread ? (
                            <>
                                <div className="p-6 border-b border-[#031E49]/10 flex justify-between items-center bg-[#F5F2EB]/50">
                                    <div>
                                        <h3 className="font-bold text-xl text-[#031E49]">Habib Rahman</h3>
                                        <p className="text-sm text-[#00B16A] font-medium">Order #RB-8402 Delay</p>
                                    </div>
                                    <button className="text-sm bg-white border border-[#031E49]/20 text-[#031E49] hover:bg-[#F5F2EB] px-4 py-2 rounded-lg font-semibold transition-colors">
                                        Mark Resolved
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
                                    {/* Customer Message */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#031E49]/10 flex items-center justify-center text-[#031E49] font-bold text-xs flex-shrink-0">HR</div>
                                        <div className="bg-[#F5F2EB] p-4 rounded-2xl rounded-tl-none border border-[#031E49]/5 max-w-[80%]">
                                            <p className="text-sm text-[#031E49]">Can I get an update on the glow mats? We need them before Friday for the main Taraweeh prayer.</p>
                                            <span className="text-[10px] text-[#031E49]/40 mt-2 block">10:45 AM</span>
                                        </div>
                                    </div>

                                    {/* Agent Message */}
                                    <div className="flex items-start gap-3 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-[#031E49] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">ERP</div>
                                        <div className="bg-[#031E49] p-4 rounded-2xl rounded-tr-none text-white max-w-[80%]">
                                            <p className="text-sm">Assalamu Alaikum Habib bhai. I am checking with the Barishal production pod right now. The glow-ink curing takes 6 hours. Let me confirm the exact dispatch time.</p>
                                            <span className="text-[10px] text-white/50 mt-2 block">10:52 AM</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-[#031E49]/10 bg-white">
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            placeholder="Type your response to Habib..."
                                            className="w-full pr-12 pl-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 focus:outline-none focus:ring-2 focus:ring-[#031E49] text-sm text-[#031E49]"
                                        />
                                        <button className="absolute right-2 p-2 rounded-lg bg-[#031E49] text-white hover:bg-[#0A2D6C] transition-colors">
                                            <PaperAirplaneIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#031E49]/30">
                                <ChatBubbleLeftRightIcon className="w-24 h-24 mb-4" />
                                <p className="font-medium text-lg text-[#031E49]/60">Select a thread to view</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
