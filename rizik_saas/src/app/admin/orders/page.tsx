"use client";

import { useState } from "react";
import { TruckIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function AdminOrdersPage() {
    const [filter, setFilter] = useState("ALL");

    const orders = [
        { id: "#RB-8405", customer: "Al-Amin Mosque", type: "B2B", product: "Glow Mats (x1000)", status: "PENDING", value: "৳ 90,000", date: "2026-02-27" },
        { id: "#RB-8404", customer: "Rafiq Uddin", type: "B2C", product: "Eco-Mat Oud Edition (x1)", status: "SHIPPED", value: "৳ 120", date: "2026-02-26" },
        { id: "#RB-8403", customer: "ACI Foods Ltd.", type: "B2B", product: "Bio-Shield Retort (x5000)", status: "MANUFACTURING", value: "৳ 425,000", date: "2026-02-26" },
        { id: "#RB-8402", customer: "Barishal Central Mosque", type: "B2B", product: "Custom Glow Mats (x500)", status: "MANUFACTURING", value: "৳ 45,000", date: "2026-02-25" },
        { id: "#RB-8401", customer: "Pran Agro Ltd.", type: "B2B", product: "Bio-Shield Matrix (x10,000)", status: "QA_CHECK", value: "৳ 120,000", date: "2026-02-24" },
        { id: "#RB-8400", customer: "Global Meat Exports", type: "B2B", product: "Retort Pouches (x2,000)", status: "SHIPPED", value: "৳ 85,000", date: "2026-02-23" },
    ];

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700",
        MANUFACTURING: "bg-blue-100 text-blue-700",
        QA_CHECK: "bg-amber-100 text-amber-700",
        SHIPPED: "bg-emerald-100 text-emerald-700",
        DELIVERED: "bg-green-100 text-green-800",
    };

    const filtered = filter === "ALL" ? orders : orders.filter(o => o.type === filter);

    return (
        <div className="w-full flex h-screen bg-[#F5F2EB]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#031E49] text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-white/10">
                    <span className="font-bold text-xl tracking-tight text-[#F5F2EB]">Rizik<span className="text-[#00B16A]">ERP</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Command Center</a>
                    <a href="/admin/orders" className="block px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold shadow-inner">Logistics & Orders</a>
                    <a href="/admin/crm" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Support CRM</a>
                    <a href="/admin/qr" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">QR Production Tags</a>
                </nav>
            </aside>

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto p-12">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-[#031E49] mb-2">Logistics & Orders</h1>
                        <p className="text-[#0A2D6C]/60">Unified order management for B2B and B2C channels.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <FunnelIcon className="w-5 h-5 text-[#031E49]/40" />
                        {["ALL", "B2B", "B2C"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === f ? 'bg-[#031E49] text-white shadow-md' : 'bg-white border border-[#031E49]/10 text-[#031E49]/60 hover:bg-[#F5F2EB]'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-[#031E49]/10 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-[#031E49]/50 uppercase bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Channel</th>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o, i) => (
                                <tr key={i} className="border-b border-[#031E49]/5 hover:bg-[#F5F2EB]/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-[#031E49]">{o.id}</td>
                                    <td className="px-6 py-4 text-[#0A2D6C]/70">{o.customer}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.type === 'B2B' ? 'bg-[#031E49] text-white' : 'bg-[#00B16A] text-white'}`}>{o.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-[#031E49]">{o.product}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {o.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#0A2D6C]/50 text-xs">{o.date}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-[#031E49]">{o.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
