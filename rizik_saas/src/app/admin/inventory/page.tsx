"use client";

import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

const stockRows = [
  { sku: "MAT-GLOW-01", item: "Glow Series Mat", warehouse: "WH-A", inStock: 12500, reorderPoint: 4000, status: "Healthy" },
  { sku: "MAT-STANDARD-01", item: "Classic Eco-Mat", warehouse: "WH-A", inStock: 2100, reorderPoint: 2500, status: "Low" },
  { sku: "BIO-RETORT-V1", item: "Retort Pouch", warehouse: "WH-B", inStock: 48000, reorderPoint: 15000, status: "Healthy" },
  { sku: "BIO-SPICE-01", item: "Raw Spice Pouch", warehouse: "WH-B", inStock: 9200, reorderPoint: 10000, status: "Low" },
  { sku: "BIO-VEG-01", item: "Vegetable Matrix", warehouse: "WH-C", inStock: 14200, reorderPoint: 12000, status: "Watch" },
];

export default function AdminInventoryPage() {
  return (
    <OpsShell
      title="Inventory Control"
      subtitle="Track stock depth, warehouse distribution, and reorder risk signals for uninterrupted operations."
      activeHref="/admin/inventory"
      scopeLabel="Admin ERP"
      roleLabel="Supply Chain"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/inventory", label: "Stock", tone: "neutral" },
        { href: "/admin/production", label: "Production", tone: "neutral" },
        { href: "/admin/orders", label: "Demand Sync", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">SKUs Under Watch</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">2</p>
          <p className="mt-2 text-xs font-semibold text-amber-600">Action required today</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Total On-Hand Units</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">86,000</p>
          <p className="mt-2 text-xs font-semibold text-[#00B16A]">Across 3 warehouses</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Procurement Alerts</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">3</p>
          <p className="mt-2 text-xs font-semibold text-[#031E49]/55">Pending vendor confirmation</p>
        </article>
      </section>

      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Warehouse Stock Matrix</h2>
          <button className="px-3 py-2 rounded-full text-xs font-bold border border-[#031E49]/15 bg-white text-[#031E49]">Export CSV</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB]">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Warehouse</th>
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
                  <td className="px-5 py-3 text-[#0A2D6C]/70">{row.warehouse}</td>
                  <td className="px-5 py-3 text-[#031E49] font-semibold">{row.inStock.toLocaleString()}</td>
                  <td className="px-5 py-3 text-[#0A2D6C]/60">{row.reorderPoint.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${row.status === "Healthy" ? "bg-emerald-100 text-emerald-700" : row.status === "Low" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
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
