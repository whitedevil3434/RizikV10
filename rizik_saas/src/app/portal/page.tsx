import Link from "next/link";
import { ChartBarIcon, CubeIcon, TruckIcon } from "@heroicons/react/24/outline";

export default function PortalPage() {
    return (
        <div className="flex h-screen w-full bg-[#F5F2EB] overflow-hidden">

            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-[#031E49]/10 bg-[#031E49] flex flex-col pt-24 pb-6 px-4 flex-shrink-0">
                <div className="flex-1 space-y-2">
                    <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-bold text-sm">
                        <ChartBarIcon className="w-5 h-5 text-[#00B16A]" />
                        Overview
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm">
                        <TruckIcon className="w-5 h-5" />
                        Active Logistics
                    </Link>
                    <Link href="/admin/crm" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm">
                        <CubeIcon className="w-5 h-5" />
                        Support CRM
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00B16A] to-emerald-400 flex items-center justify-center text-white font-bold text-lg">
                            NM
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">Nusrat M.</p>
                            <p className="text-xs text-white/50">Managing Director</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Dashboard Area */}
            <main className="flex-1 overflow-y-auto pt-24 px-8 pb-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[#031E49] mb-2">B2B Command Center</h1>
                    <p className="text-[#0A2D6C]/60">Real-time metrics for Bio-Shield production and Elite Mat distribution.</p>
                </header>

                {/* Top KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B16A]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                        <div className="text-sm font-medium text-[#0A2D6C]/60 mb-2">Total B2B Revenue (MTD)</div>
                        <div className="text-3xl font-bold text-[#031E49]">৳ 1.2M</div>
                        <div className="mt-4 text-xs font-semibold text-[#00B16A] flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            +24% from last month
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#031E49]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                        <div className="text-sm font-medium text-[#0A2D6C]/60 mb-2">Eco-Mats Pre-Orders</div>
                        <div className="text-3xl font-bold text-[#031E49]">12,500</div>
                        <div className="mt-4 text-xs font-medium text-[#0A2D6C]/50">Ramadan 2026 Fleet</div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-[#031E49]/10 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B16A]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                        <div className="text-sm font-medium text-[#0A2D6C]/60 mb-2">Active Retort Batches</div>
                        <div className="text-3xl font-bold text-[#031E49]">48</div>
                        <div className="mt-4 text-xs font-medium text-[#0A2D6C]/50">Bio-Shield Poly-Tech (1yr expiry)</div>
                    </div>
                </div>

                {/* Recent Orders Table Area */}
                <div className="w-full bg-white border border-[#031E49]/10 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#031E49]">Recent Global Logistics</h2>
                        <button className="text-sm font-semibold text-[#00B16A] hover:text-emerald-700">View All Database</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#0A2D6C]/70">
                            <thead className="text-xs text-[#031E49]/50 uppercase bg-[#F5F2EB] border-b border-[#031E49]/10">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold rounded-tl-xl">Order ID</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Organization</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Type</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                                    <th scope="col" className="px-6 py-4 font-semibold rounded-tr-xl text-right">Value (BDT)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-[#031E49]/5 hover:bg-[#F5F2EB]/50 transition-colors">
                                    <td className="px-6 py-4 text-[#031E49] font-bold">#RB-8402</td>
                                    <td className="px-6 py-4">Barishal Central Mosque</td>
                                    <td className="px-6 py-4 text-[#031E49]">Custom Glow Mats (x500)</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">Manufacturing</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-[#031E49] font-semibold">45,000</td>
                                </tr>
                                <tr className="border-b border-[#031E49]/5 hover:bg-[#F5F2EB]/50 transition-colors">
                                    <td className="px-6 py-4 text-[#031E49] font-bold">#RB-8401</td>
                                    <td className="px-6 py-4">Pran Agro Ltd.</td>
                                    <td className="px-6 py-4 text-[#031E49]">Bio-Shield Matrix (x10,000)</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-700 text-xs font-semibold">Quality Checking</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-[#031E49] font-semibold">120,000</td>
                                </tr>
                                <tr className="hover:bg-[#F5F2EB]/50 transition-colors">
                                    <td className="px-6 py-4 text-[#031E49] font-bold">#RB-8400</td>
                                    <td className="px-6 py-4">Global Meat Exports</td>
                                    <td className="px-6 py-4 text-[#031E49]">Retort Pouches (x2,000)</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">Ready to Ship</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-[#031E49] font-semibold">85,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
