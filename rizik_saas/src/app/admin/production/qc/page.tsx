import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";

export default async function QCInspectionsPage() {
    const admin = createAdminClient();
    const { data: inspections } = await admin.from("rizik_qc_inspections").select("*").order("inspected_at", { ascending: false });
    const { data: batchData } = await admin.from("rizik_production_batches").select("id, batch_code, product_sku");

    const batchMap = new Map((batchData || []).map((b: { id: string; batch_code: string; product_sku: string }) => [b.id, b]));
    const records = (inspections || []) as Array<{ id: string; batch_id: string; inspection_type: string; result: string; defect_count: number; defect_notes: string | null; inspected_at: string }>;

    const resultColor: Record<string, string> = { PASS: "bg-emerald-100 text-emerald-700", FAIL: "bg-red-100 text-red-700", CONDITIONAL: "bg-amber-100 text-amber-700" };
    const typeColor: Record<string, string> = { VISUAL: "bg-blue-100 text-blue-700", DIMENSIONAL: "bg-purple-100 text-purple-700", MATERIAL: "bg-indigo-100 text-indigo-700" };

    return (
        <OpsShell title="Quality Control" subtitle="Inspection results for production batches — pass, fail, and conditional reports." activeHref="/admin/production" scopeLabel="Admin ERP" roleLabel="QC Operations" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/production/batches", label: "Batches", tone: "neutral" }, { href: "/admin/production/qc", label: "QC", tone: "primary" }, { href: "/admin/production/suppliers", label: "Suppliers", tone: "neutral" }]}>
            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">Inspection Log</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr><th className="px-5 py-3">Batch</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Result</th><th className="px-5 py-3">Defects</th><th className="px-5 py-3">Notes</th><th className="px-5 py-3">Date</th></tr>
                        </thead>
                        <tbody>{records.map(r => {
                            const batch = batchMap.get(r.batch_id) as { batch_code: string; product_sku: string } | undefined; return (
                                <tr key={r.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3 font-mono text-xs font-bold text-[#031E49]">{batch?.batch_code || "—"}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{batch?.product_sku || "—"}</td>
                                    <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColor[r.inspection_type] || "bg-gray-100"}`}>{r.inspection_type}</span></td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${resultColor[r.result] || "bg-gray-100"}`}>{r.result}</span></td>
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">{r.defect_count}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/60 max-w-[250px] truncate">{r.defect_notes || "—"}</td>
                                    <td className="px-5 py-3 text-xs text-[#0A2D6C]/50">{new Date(r.inspected_at).toLocaleDateString("en-GB")}</td>
                                </tr>);
                        })}</tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
