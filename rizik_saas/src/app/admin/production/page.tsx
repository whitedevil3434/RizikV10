import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AdminProductionPage() {
  const admin = createAdminClient();

  // Fetch LIVE batch data
  const { data: batches } = await admin.from("rizik_production_batches")
    .select("id, batch_code, product_sku, quantity_target, quantity_produced, quantity_rejected, status, start_date")
    .order("created_at", { ascending: false });

  // Fetch employee names for operator display
  const { data: employees } = await admin.from("rizik_employees")
    .select("id, full_name, department")
    .eq("department", "Production");

  const batchList = (batches || []) as Array<{
    id: string; batch_code: string; product_sku: string; quantity_target: number;
    quantity_produced: number; quantity_rejected: number; status: string; start_date: string | null;
  }>;
  const prodTeam = (employees || []) as Array<{ id: string; full_name: string }>;

  const totalProduced = batchList.reduce((s, b) => s + b.quantity_produced, 0);
  const totalRejected = batchList.reduce((s, b) => s + b.quantity_rejected, 0);
  const activeBatches = batchList.filter(b => b.status === "IN_PROGRESS").length;
  const yieldRate = totalProduced > 0 ? ((totalProduced - totalRejected) / totalProduced * 100).toFixed(1) : "0";

  const statusColor: Record<string, string> = {
    PLANNED: "bg-gray-100 text-gray-700", IN_PROGRESS: "bg-blue-100 text-blue-700",
    QC_HOLD: "bg-amber-100 text-amber-700", COMPLETED: "bg-emerald-100 text-emerald-700",
  };

  return (
    <OpsShell
      title="Production Command"
      subtitle="Monitor live batch execution, yield rates, and production team across all lines."
      activeHref="/admin/production"
      scopeLabel="Admin ERP"
      roleLabel="Manufacturing Control"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/production/batches", label: "All Batches", tone: "neutral" },
        { href: "/admin/production/qc", label: "QC Log", tone: "neutral" },
        { href: "/admin/production/suppliers", label: "Suppliers", tone: "neutral" },
        { href: "/admin/production/bom", label: "BOM", tone: "primary" },
      ]}
    >
      {/* Live KPIs */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Active Batches</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{activeBatches}</p>
          <p className="mt-2 text-xs font-semibold text-blue-500">Currently in progress</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Total Output</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{totalProduced.toLocaleString()}</p>
          <p className="mt-2 text-xs font-semibold text-[#00B16A]">Units produced</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Yield Rate</p>
          <p className="mt-2 text-3xl font-bold text-[#00B16A]">{yieldRate}%</p>
          <p className="mt-2 text-xs font-semibold text-[#031E49]/55">{totalRejected} rejected</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Production Team</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{prodTeam.length}</p>
          <p className="mt-2 text-xs font-semibold text-[#031E49]/55">{prodTeam.map(e => e.full_name.split(" ")[0]).slice(0, 3).join(", ")}</p>
        </article>
      </section>

      {/* Batch Execution Queue */}
      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Batch Execution Queue</h2>
          <Link href="/admin/production/batches" className="px-3 py-2 rounded-full text-xs font-bold bg-[#031E49] text-white hover:bg-[#0A2D6C]">View Full Batches →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB]">
              <tr>
                <th className="px-5 py-3">Batch</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Produced</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {batchList.map((batch) => {
                const pct = batch.quantity_target > 0 ? Math.round(batch.quantity_produced / batch.quantity_target * 100) : 0;
                return (
                  <tr key={batch.id} className="border-t border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-[#031E49]">{batch.batch_code}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{batch.product_sku}</td>
                    <td className="px-5 py-3 text-[#031E49]">{batch.quantity_target.toLocaleString()}</td>
                    <td className="px-5 py-3 font-semibold text-[#031E49]">{batch.quantity_produced.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-[#031E49]/10 overflow-hidden">
                          <div className="h-full rounded-full bg-[#00B16A]" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[#031E49]">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[batch.status] || "bg-gray-100 text-gray-700"}`}>
                        {batch.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </OpsShell>
  );
}
