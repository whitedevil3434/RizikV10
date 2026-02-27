"use client";

import { useState } from "react";
import Link from "next/link";
import { UserGroupIcon, ChevronRightIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
    joinDate: string;
}

const employees: Employee[] = [
    { id: "E001", name: "Nusrat Meherun", role: "SUPER_ADMIN", department: "Executive", email: "nusrat@rizik.io", status: "ACTIVE", joinDate: "2025-01-15" },
    { id: "E002", name: "Sabbir Ahmed", role: "SUPER_ADMIN", department: "Technology", email: "sabbir@rizik.io", status: "ACTIVE", joinDate: "2025-01-15" },
    { id: "E003", name: "Farhan Rahman", role: "PRODUCTION_MANAGER", department: "Manufacturing", email: "farhan@rizik.io", status: "ACTIVE", joinDate: "2025-03-01" },
    { id: "E004", name: "Aisha Begum", role: "SUPPORT_AGENT", department: "Customer Support", email: "aisha@rizik.io", status: "ACTIVE", joinDate: "2025-04-10" },
    { id: "E005", name: "Kamal Hossain", role: "LOGISTICS_MANAGER", department: "Logistics", email: "kamal@rizik.io", status: "ACTIVE", joinDate: "2025-05-20" },
    { id: "E006", name: "Rima Sultana", role: "SUPPORT_AGENT", department: "Customer Support", email: "rima@rizik.io", status: "ON_LEAVE", joinDate: "2025-07-01" },
];

const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-700",
    PRODUCTION_MANAGER: "bg-blue-100 text-blue-700",
    LOGISTICS_MANAGER: "bg-amber-100 text-amber-700",
    SUPPORT_AGENT: "bg-purple-100 text-purple-700",
    B2B_BUYER: "bg-emerald-100 text-emerald-700",
    CUSTOMER: "bg-gray-100 text-gray-700",
};

const roleHierarchy = [
    { role: "SUPER_ADMIN", label: "Super Admin", desc: "Full system access. Can manage all modules, users, and settings.", level: 5 },
    { role: "PRODUCTION_MANAGER", label: "Production Manager", desc: "Manages manufacturing batches, QR generation, and quality control.", level: 4 },
    { role: "LOGISTICS_MANAGER", label: "Logistics Manager", desc: "Handles order fulfillment, shipping, and delivery tracking.", level: 3 },
    { role: "SUPPORT_AGENT", label: "Support Agent", desc: "Manages customer tickets, CRM communications, and issue resolution.", level: 2 },
    { role: "B2B_BUYER", label: "B2B Buyer", desc: "External business customers. Can view portal and place bulk orders.", level: 1 },
    { role: "CUSTOMER", label: "Customer", desc: "End consumers. Can browse store, add to cart, and place orders.", level: 0 },
];

export default function AdminTeamPage() {
    const [view, setView] = useState<"team" | "rbac">("team");

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
                    <a href="/admin/team" className="block px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold shadow-inner">Team & RBAC</a>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-12">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-[#031E49] mb-2">Team & Access Control</h1>
                        <p className="text-[#0A2D6C]/60">Manage employees and role-based access hierarchy.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setView("team")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === "team" ? "bg-[#031E49] text-white shadow-md" : "bg-white border border-[#031E49]/10 text-[#031E49]/60"}`}>
                            <UserGroupIcon className="w-4 h-4 inline mr-1" /> Team
                        </button>
                        <button onClick={() => setView("rbac")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === "rbac" ? "bg-[#031E49] text-white shadow-md" : "bg-white border border-[#031E49]/10 text-[#031E49]/60"}`}>
                            <ShieldCheckIcon className="w-4 h-4 inline mr-1" /> RBAC Hierarchy
                        </button>
                    </div>
                </header>

                {view === "team" ? (
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-[#031E49]/50 uppercase bg-[#F5F2EB] border-b border-[#031E49]/10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">ID</th>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Department</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((e) => (
                                    <tr key={e.id} className="border-b border-[#031E49]/5 hover:bg-[#F5F2EB]/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-[#0A2D6C]/40">{e.id}</td>
                                        <td className="px-6 py-4 font-bold text-[#031E49]">{e.name}</td>
                                        <td className="px-6 py-4 text-[#0A2D6C]/70">{e.department}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleColors[e.role]}`}>{e.role.replace(/_/g, " ")}</span>
                                        </td>
                                        <td className="px-6 py-4 text-[#0A2D6C]/50 text-xs">{e.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${e.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : e.status === "ON_LEAVE" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                                {e.status.replace("_", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {roleHierarchy.map((r, i) => (
                            <div key={r.role} className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-[#031E49]/10 flex items-center justify-center text-lg font-bold text-[#031E49]">
                                    L{r.level}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleColors[r.role]}`}>{r.role.replace(/_/g, " ")}</span>
                                        <span className="text-lg font-bold text-[#031E49]">{r.label}</span>
                                    </div>
                                    <p className="text-sm text-[#0A2D6C]/50">{r.desc}</p>
                                </div>
                                <div className="text-xs text-[#0A2D6C]/30 font-mono">
                                    {employees.filter(e => e.role === r.role).length} active
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
