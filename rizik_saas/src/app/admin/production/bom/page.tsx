import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function BOMPage() {
    const admin = createAdminClient();
    const { data } = await admin.from("rizik_bom").select("*").order("product_sku");
    const items = (data || []) as Array<{
        id: string; product_sku: string; material_name: string; material_sku: string | null;
        quantity_per_unit: number; unit: string; cost_per_unit_bdt: number;
    }>;

    // Group by product
    const grouped = new Map<string, typeof items>();
    for (const item of items) {
        const list = grouped.get(item.product_sku) || [];
        list.push(item);
        grouped.set(item.product_sku, list);
    }

    return (
        <OpsShell title="Bill of Materials" subtitle="Material breakdown and cost structure per product." activeHref="/admin/production" scopeLabel="Admin ERP" roleLabel="Production Ops" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/production/batches", label: "Batches", tone: "neutral" }, { href: "/admin/production/suppliers", label: "Suppliers", tone: "neutral" }, { href: "/admin/production/bom", label: "BOM", tone: "primary" }]}>

            {Array.from(grouped.entries()).map(([sku, materials]) => {
                const unitCost = materials.reduce((s, m) => s + (m.quantity_per_unit * m.cost_per_unit_bdt), 0);
                return (
                    <section key={sku} className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden mb-6">
                        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#031E49] font-mono">{sku}</h2>
                                <p className="text-xs text-[#0A2D6C]/50">{materials.length} materials</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-[#0A2D6C]/50">UNIT COST</p>
                                <p className="text-lg font-bold text-[#031E49]">৳{Math.round(unitCost).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                                    <tr><th className="px-5 py-3">Material</th><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Qty/Unit</th><th className="px-5 py-3">Unit</th><th className="px-5 py-3">Cost/Unit</th><th className="px-5 py-3">Line Cost</th></tr>
                                </thead>
                                <tbody>{materials.map(m => (
                                    <tr key={m.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                        <td className="px-5 py-3 font-semibold text-[#031E49]">{m.material_name}</td>
                                        <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{m.material_sku || "—"}</td>
                                        <td className="px-5 py-3 text-[#031E49]">{m.quantity_per_unit}</td>
                                        <td className="px-5 py-3 text-[#0A2D6C]/60">{m.unit}</td>
                                        <td className="px-5 py-3 text-[#0A2D6C]/70">৳{Math.round(m.cost_per_unit_bdt)}</td>
                                        <td className="px-5 py-3 font-semibold text-[#031E49]">৳{Math.round(m.quantity_per_unit * m.cost_per_unit_bdt)}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </section>
                );
            })}
        </OpsShell>
    );
}
