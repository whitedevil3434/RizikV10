import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";


export default async function ProductionBatchesPage() {
    const admin = createAdminClient();
    const { data } = await admin.from("rizik_production_batches").select("*").order("created_at", { ascending: false });
    const batches = (data || []) as Array<{
        id: string; batch_code: string; product_sku: string; quantity_target: number;
        quantity_produced: number; quantity_rejected: number; status: string;
        start_date: string | null; end_date: string | null; created_at: string;
    }>;

    const statusColor: Record<string, string> = {
        PLANNED: "bg-gray-100 text-gray-700", IN_PROGRESS: "bg-blue-100 text-blue-700",
        QC_HOLD: "bg-amber-100 text-amber-700", COMPLETED: "bg-emerald-100 text-emerald-700",
    };

    const totalProduced = batches.reduce((s, b) => s + b.quantity_produced, 0);
    const totalRejected = batches.reduce((s, b) => s + b.quantity_rejected, 0);
    const yieldRate = totalProduced > 0 ? ((totalProduced - totalRejected) / totalProduced * 100).toFixed(1) : "0";

    return (
        <OpsShell title="Production Batches" subtitle="Track production runs from planning through QC to completion." activeHref="/admin/production" scopeLabel="Admin ERP" roleLabel="Production Ops" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/production/batches", label: "Batches", tone: "primary" }, { href: "/admin/production/qc", label: "QC", tone: "neutral" }, { href: "/admin/production/suppliers", label: "Suppliers", tone: "neutral" }]}>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">TOTAL PRODUCED</p>
                    <p className="text-2xl font-bold text-[#031E49]">{totalProduced.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">REJECTED</p>
                    <p className="text-2xl font-bold text-red-600">{totalRejected}</p>
                </div>
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">YIELD RATE</p>
                    <p className="text-2xl font-bold text-[#00B16A]">{yieldRate}%</p>
                </div>
            </div>

            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">Active Batches</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr><th className="px-5 py-3">Batch</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Target</th><th className="px-5 py-3">Produced</th><th className="px-5 py-3">Rejected</th><th className="px-5 py-3">Progress</th><th className="px-5 py-3">Status</th></tr>
                        </thead>
                        <tbody>{batches.map(b => {
                            const pct = b.quantity_target > 0 ? Math.round(b.quantity_produced / b.quantity_target * 100) : 0;
                            return (
                                <tr key={b.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3 font-mono text-xs font-bold text-[#031E49]">{b.batch_code}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{b.product_sku}</td>
                                    <td className="px-5 py-3 text-[#031E49]">{b.quantity_target.toLocaleString()}</td>
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">{b.quantity_produced.toLocaleString()}</td>
                                    <td className="px-5 py-3 text-red-600">{b.quantity_rejected}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 rounded-full bg-[#031E49]/10 overflow-hidden">
                                                <div className="h-full rounded-full bg-[#00B16A]" style={{ width: `${Math.min(pct, 100)}%` }} />
                                            </div>
                                            <span className="text-xs font-semibold text-[#031E49]">{pct}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[b.status] || "bg-gray-100"}`}>{b.status.replace("_", " ")}</span></td>
                                </tr>);
                        })}</tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
