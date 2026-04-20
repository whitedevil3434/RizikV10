import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SuppliersPage() {
    const admin = createAdminClient();
    const { data } = await admin.from("rizik_suppliers").select("*").order("rating", { ascending: false });
    const suppliers = (data || []) as Array<{
        id: string; company_name: string; contact_name: string | null; email: string | null;
        phone: string | null; category: string; rating: number; total_orders: number;
        on_time_delivery_pct: number; notes: string | null;
    }>;

    const catColor: Record<string, string> = { RAW_MATERIAL: "bg-indigo-100 text-indigo-700", PACKAGING: "bg-cyan-100 text-cyan-700", LOGISTICS: "bg-amber-100 text-amber-700" };

    return (
        <OpsShell title="Supplier Directory" subtitle="Track supplier performance, ratings, and delivery reliability." activeHref="/admin/production" scopeLabel="Admin ERP" roleLabel="Supply Chain" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/production/batches", label: "Batches", tone: "neutral" }, { href: "/admin/production/suppliers", label: "Suppliers", tone: "primary" }, { href: "/admin/production/bom", label: "BOM", tone: "neutral" }]}>
            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">All Suppliers</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Rating</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">On-Time %</th><th className="px-5 py-3">Notes</th></tr>
                        </thead>
                        <tbody>{suppliers.map(s => (
                            <tr key={s.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                <td className="px-5 py-3"><p className="font-semibold text-[#031E49]">{s.company_name}</p><p className="text-[11px] text-[#0A2D6C]/45">{s.email || ""}</p></td>
                                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${catColor[s.category] || "bg-gray-100"}`}>{s.category.replace("_", " ")}</span></td>
                                <td className="px-5 py-3 text-[#0A2D6C]/70">{s.contact_name || "—"}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-bold text-[#031E49]">{s.rating}</span>
                                        <span className="text-amber-400 text-xs">★</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-[#031E49]">{s.total_orders}</td>
                                <td className="px-5 py-3">
                                    <span className={`font-semibold ${s.on_time_delivery_pct >= 90 ? "text-[#00B16A]" : s.on_time_delivery_pct >= 80 ? "text-amber-600" : "text-red-600"}`}>
                                        {s.on_time_delivery_pct}%
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-xs text-[#0A2D6C]/50 max-w-[200px] truncate">{s.notes || "—"}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
