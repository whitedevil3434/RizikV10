import Link from "next/link";
import { ChartBarIcon, ChatBubbleLeftRightIcon, QrCodeIcon, TruckIcon, UserGroupIcon, CubeIcon } from "@heroicons/react/24/outline";

export default function AdminDashboard() {
    const stats = [
        { label: "Total Revenue (MTD)", value: "৳ 2.4M", change: "+18%", positive: true },
        { label: "Active Orders", value: "142", change: "+7", positive: true },
        { label: "Production Batches", value: "48", change: "3 pending QA", positive: false },
        { label: "Support Tickets", value: "12", change: "3 open", positive: false },
    ];

    const modules = [
        { name: "Logistics & Orders", desc: "Track shipments, manage fulfillment pipeline", icon: TruckIcon, href: "/admin/orders", color: "bg-blue-50 text-blue-700" },
        { name: "Support CRM", desc: "Customer communications, ticket management", icon: ChatBubbleLeftRightIcon, href: "/admin/crm", color: "bg-amber-50 text-amber-700" },
        { name: "QR Production Tags", desc: "Generate and manage cryptographic product QR codes", icon: QrCodeIcon, href: "/admin/qr", color: "bg-emerald-50 text-emerald-700" },
        { name: "Team & Hierarchy", desc: "Employee profiles, RBAC roles, department structure", icon: UserGroupIcon, href: "#", color: "bg-purple-50 text-purple-700" },
        { name: "Inventory", desc: "Raw materials, finished goods, warehouse stock levels", icon: CubeIcon, href: "#", color: "bg-rose-50 text-rose-700" },
        { name: "Analytics", desc: "Revenue reports, conversion funnels, customer insights", icon: ChartBarIcon, href: "#", color: "bg-cyan-50 text-cyan-700" },
    ];

    return (
        <div className="w-full flex h-screen bg-[#F5F2EB]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#031E49] text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-white/10">
                    <span className="font-bold text-xl tracking-tight text-[#F5F2EB]">Rizik<span className="text-[#00B16A]">ERP</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="/admin" className="block px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-bold shadow-inner">Command Center</a>
                    <a href="/admin/orders" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Logistics & Orders</a>
                    <a href="/admin/crm" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">Support CRM</a>
                    <a href="/admin/qr" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors">QR Production Tags</a>
                </nav>
            </aside>

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto p-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-[#031E49] mb-2">Command Center</h1>
                    <p className="text-[#0A2D6C]/60">Rizik Ecosystem Administrative Overview</p>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm">
                            <div className="text-sm font-medium text-[#0A2D6C]/60 mb-1">{s.label}</div>
                            <div className="text-3xl font-bold text-[#031E49]">{s.value}</div>
                            <div className={`mt-3 text-xs font-semibold ${s.positive ? 'text-[#00B16A]' : 'text-amber-600'}`}>{s.change}</div>
                        </div>
                    ))}
                </div>

                {/* Module Cards */}
                <h2 className="text-xl font-bold text-[#031E49] mb-6">ERP Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((m, i) => (
                        <Link key={i} href={m.href} className="group bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
                            <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center mb-4`}>
                                <m.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-[#031E49] mb-1 group-hover:text-[#00B16A] transition-colors">{m.name}</h3>
                            <p className="text-sm text-[#0A2D6C]/50">{m.desc}</p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
