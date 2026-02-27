"use client";

import { useState } from "react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenueData = [45000, 62000, 78000, 95000, 110000, 135000, 168000, 192000, 230000, 275000, 320000, 410000];
const ordersData = [12, 18, 24, 31, 38, 45, 56, 63, 75, 89, 102, 128];
const maxRevenue = Math.max(...revenueData);

const categoryBreakdown = [
    { name: "Eco-Mats", value: 62, color: "#031E49" },
    { name: "Bio-Shield", value: 38, color: "#00B16A" },
];

const topProducts = [
    { name: "Glow Series Mat", sold: 1240, revenue: 186000 },
    { name: "Retort Pouch (1yr)", sold: 890, revenue: 75650 },
    { name: "Oud Infused Mat", sold: 760, revenue: 91200 },
    { name: "Vegetable Membrane", sold: 12500, revenue: 312500 },
    { name: "Classic Mat", sold: 3200, revenue: 160000 },
];

export default function AdminAnalyticsPage() {
    const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

    return (
        <div className="w-full flex h-screen bg-[#F5F2EB]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#031E49] text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-white/10">
                    <span className="font-bold text-xl tracking-tight text-[#F5F2EB]">Rizik<span className="text-[#00B16A]">ERP</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Command Center</a>
                    <a href="/admin/products" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Product Catalog</a>
                    <a href="/admin/orders" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Logistics & Orders</a>
                    <a href="/admin/crm" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Support CRM</a>
                    <a href="/admin/qr" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">QR Production Tags</a>
                    <a href="/admin/team" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Team & RBAC</a>
                    <a href="/admin/analytics" className="block px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold shadow-inner">Analytics</a>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[#031E49] mb-2">Business Analytics</h1>
                    <p className="text-[#0A2D6C]/60">Revenue, orders, and product performance insights.</p>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-5 shadow-sm">
                        <p className="text-xs text-[#031E49]/40 font-semibold uppercase">Total Revenue (YTD)</p>
                        <p className="text-3xl font-bold text-[#031E49] mt-2">৳{(revenueData.reduce((a, b) => a + b, 0) / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-[#00B16A] font-bold mt-1">↗ +312% from last year</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-5 shadow-sm">
                        <p className="text-xs text-[#031E49]/40 font-semibold uppercase">Total Orders</p>
                        <p className="text-3xl font-bold text-[#031E49] mt-2">{ordersData.reduce((a, b) => a + b, 0).toLocaleString()}</p>
                        <p className="text-xs text-[#00B16A] font-bold mt-1">↗ 128 this month</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-5 shadow-sm">
                        <p className="text-xs text-[#031E49]/40 font-semibold uppercase">Avg Order Value</p>
                        <p className="text-3xl font-bold text-[#031E49] mt-2">৳3,205</p>
                        <p className="text-xs text-[#00B16A] font-bold mt-1">↗ +18% from last month</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-5 shadow-sm">
                        <p className="text-xs text-[#031E49]/40 font-semibold uppercase">Active Products</p>
                        <p className="text-3xl font-bold text-[#031E49] mt-2">6</p>
                        <p className="text-xs text-[#0A2D6C]/40 font-bold mt-1">2 categories</p>
                    </div>
                </div>

                {/* Revenue Chart (CSS bar chart) */}
                <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm mb-8">
                    <h2 className="text-lg font-bold text-[#031E49] mb-6">Monthly Revenue (2026)</h2>
                    <div className="flex items-end gap-2 h-48">
                        {revenueData.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] text-[#031E49]/40 font-mono">৳{(val / 1000).toFixed(0)}k</span>
                                <div
                                    className="w-full rounded-t-lg bg-gradient-to-t from-[#031E49] to-[#0A2D6C] hover:from-[#00B16A] hover:to-emerald-600 transition-colors cursor-pointer"
                                    style={{ height: `${(val / maxRevenue) * 100}%` }}
                                    title={`${months[i]}: ৳${val.toLocaleString()}`}
                                />
                                <span className="text-[10px] text-[#031E49]/50 font-semibold">{months[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category Breakdown */}
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[#031E49] mb-6">Revenue by Category</h2>
                        <div className="space-y-4">
                            {categoryBreakdown.map((cat) => (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-[#031E49]">{cat.name}</span>
                                        <span className="font-bold text-[#031E49]">{cat.value}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-[#F5F2EB] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[#031E49] mb-6">Top Products</h2>
                        <div className="space-y-3">
                            {topProducts.map((p, i) => (
                                <div key={p.name} className="flex items-center gap-4">
                                    <span className="w-6 h-6 rounded-full bg-[#031E49]/10 flex items-center justify-center text-xs font-bold text-[#031E49]">{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-[#031E49]">{p.name}</p>
                                        <p className="text-xs text-[#0A2D6C]/40">{p.sold.toLocaleString()} units sold</p>
                                    </div>
                                    <span className="text-sm font-bold text-[#031E49]">৳{(p.revenue / 1000).toFixed(0)}k</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
