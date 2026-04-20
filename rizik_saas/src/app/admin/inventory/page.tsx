import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AdminInventoryPage() {
  const admin = createAdminClient();

  // Fetch real products for stock data
  const { data: products } = await admin.from("empire_products").select("sku, name, price, is_active");
  const prods = (products || []) as Array<{ sku: string; name: string; price: number; is_active: boolean }>;

  // Fetch production batches for production stats
  const { data: batches } = await admin.from("rizik_production_batches").select("product_sku, quantity_produced, quantity_rejected, status");
  const bats = (batches || []) as Array<{ product_sku: string; quantity_produced: number; quantity_rejected: number; status: string }>;

  // Build stock matrix from real products + production data
  const stockRows = prods.map(p => {
    const produced = bats.filter(b => b.product_sku === p.sku).reduce((s, b) => s + b.quantity_produced, 0);
    const rejected = bats.filter(b => b.product_sku === p.sku).reduce((s, b) => s + b.quantity_rejected, 0);
    const inStock = produced - rejected;
    const reorderPoint = Math.max(100, Math.floor(produced * 0.3));
    const status = inStock <= 0 ? "Out" : inStock < reorderPoint ? "Low" : inStock < reorderPoint * 1.5 ? "Watch" : "Healthy";
    return { sku: p.sku, item: p.name, inStock, reorderPoint, status, isActive: p.is_active };
  });

  const totalOnHand = stockRows.reduce((s, r) => s + Math.max(0, r.inStock), 0);
  const lowCount = stockRows.filter(r => r.status === "Low" || r.status === "Out").length;
  const activeSkus = stockRows.filter(r => r.isActive).length;

  const statusColor: Record<string, string> = {
    Healthy: "bg-emerald-100 text-emerald-700",
    Watch: "bg-amber-100 text-amber-700",
    Low: "bg-red-100 text-red-700",
    Out: "bg-red-200 text-red-800",
  };

  return (
    <OpsShell
      title="Inventory Control"
      subtitle="Real-time stock depth, production output tracking, and reorder alerts."
      activeHref="/admin/inventory"
      scopeLabel="Admin ERP"
      roleLabel="Supply Chain"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/inventory", label: "Stock", tone: "primary" },
        { href: "/admin/production/batches", label: "Production", tone: "neutral" },
        { href: "/admin/production/suppliers", label: "Suppliers", tone: "neutral" },
      ]}
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">SKUs Under Watch</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{lowCount}</p>
          <p className="mt-2 text-xs font-semibold text-amber-600">{lowCount > 0 ? "Reorder required" : "All healthy"}</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Total On-Hand Units</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{totalOnHand.toLocaleString()}</p>
          <p className="mt-2 text-xs font-semibold text-[#00B16A]">From production output</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Active SKUs</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{activeSkus}</p>
          <p className="mt-2 text-xs font-semibold text-[#031E49]/55">{prods.length} total products</p>
        </article>
      </section>

      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Stock Matrix</h2>
          <Link href="/admin/production/batches" className="px-3 py-2 rounded-full text-xs font-bold border border-[#031E49]/15 bg-white text-[#031E49] hover:bg-[#F5F2EB]">View Batches →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB]">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">In Stock</th>
                <th className="px-5 py-3">Reorder Point</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((row) => (
                <tr key={row.sku} className="border-t border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                  <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{row.sku}</td>
                  <td className="px-5 py-3 font-semibold text-[#031E49]">{row.item}</td>
                  <td className="px-5 py-3 text-[#031E49] font-semibold">{Math.max(0, row.inStock).toLocaleString()}</td>
                  <td className="px-5 py-3 text-[#0A2D6C]/60">{row.reorderPoint.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[row.status] || "bg-gray-100 text-gray-700"}`}>
                      {row.status}
                    </span>
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
