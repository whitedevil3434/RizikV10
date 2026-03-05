import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";
import Link from "next/link";

export default async function CustomerDirectoryPage() {
    const admin = createAdminClient();
    const { data } = await admin
        .from("rizik_customers")
        .select("*")
        .order("total_spent_bdt", { ascending: false });

    const customers = (data || []) as Array<{
        id: string; name: string; email: string | null; phone: string | null;
        company: string | null; channel: string; total_orders: number;
        total_spent_bdt: number; lifetime_value_bdt: number;
        tags: string[] | null; created_at: string;
    }>;

    function formatBDT(n: number) {
        if (n >= 1000000) return `৳${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
        return `৳${Math.round(n).toLocaleString()}`;
    }

    const totalLTV = customers.reduce((s, c) => s + c.lifetime_value_bdt, 0);
    const b2bCount = customers.filter(c => c.channel === "B2B").length;

    return (
        <OpsShell
            title="Customer Directory"
            subtitle="360° view of all customers with lifetime value, order history, and segmentation."
            activeHref="/admin/crm"
            scopeLabel="Admin ERP"
            roleLabel="CRM Operations"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/crm", label: "Support", tone: "neutral" },
                { href: "/admin/crm/customers", label: "Customers", tone: "primary" },
            ]}
        >
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">TOTAL CUSTOMERS</p>
                    <p className="text-2xl font-bold text-[#031E49]">{customers.length}</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">TOTAL LTV</p>
                    <p className="text-2xl font-bold text-[#031E49]">{formatBDT(totalLTV)}</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">B2B ACCOUNTS</p>
                    <p className="text-2xl font-bold text-[#031E49]">{b2bCount}</p>
                </div>
            </div>

            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10">
                    <h2 className="text-base font-bold text-[#031E49]">All Customers</h2>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-3">
                    {customers.map(c => (
                        <Link key={c.id} href={`/admin/crm/customers/${c.id}`} className="block rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4 hover:bg-[#F5F2EB]/70 transition-colors">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-[#031E49]">{c.name}</p>
                                    <p className="text-xs text-[#0A2D6C]/50">{c.company || c.email || "—"}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.channel === "B2B" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                                    {c.channel}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="text-[#031E49] font-semibold">{formatBDT(c.lifetime_value_bdt)} LTV</span>
                                <span className="text-[#0A2D6C]/50">{c.total_orders} orders</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Channel</th>
                                <th className="px-5 py-3">Orders</th>
                                <th className="px-5 py-3">Total Spent</th>
                                <th className="px-5 py-3">LTV</th>
                                <th className="px-5 py-3">Tags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3">
                                        <Link href={`/admin/crm/customers/${c.id}`} className="font-semibold text-[#031E49] hover:text-[#00B16A]">{c.name}</Link>
                                        <p className="text-[11px] text-[#0A2D6C]/45">{c.company || c.email || ""}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.channel === "B2B" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                                            {c.channel}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-[#031E49]">{c.total_orders}</td>
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">{formatBDT(c.total_spent_bdt)}</td>
                                    <td className="px-5 py-3 font-bold text-[#031E49]">{formatBDT(c.lifetime_value_bdt)}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {(c.tags || []).slice(0, 3).map(t => (
                                                <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#031E49]/10 text-[#031E49]/70">{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
