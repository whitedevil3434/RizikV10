"use client";

import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

const lineHealth = [
  { line: "Line A", utilization: "91%", output: "4,200 units", status: "Healthy" },
  { line: "Line B", utilization: "84%", output: "3,650 units", status: "Healthy" },
  { line: "Line C", utilization: "68%", output: "2,100 units", status: "Needs Maintenance" },
];

const batches = [
  { batch: "RB-PRD-2201", product: "Bio-Shield Retort", stage: "Sterilization", eta: "12:30", owner: "Shamim" },
  { batch: "RB-PRD-2202", product: "Glow Mats", stage: "Curing", eta: "13:15", owner: "Nabila" },
  { batch: "RB-PRD-2203", product: "Raw Spice Pouch", stage: "QA Hold", eta: "14:00", owner: "Jahid" },
  { batch: "RB-PRD-2204", product: "Classic Eco-Mat", stage: "Packaging", eta: "15:40", owner: "Rifat" },
];

export default function AdminProductionPage() {
  return (
    <OpsShell
      title="Production Command"
      subtitle="Monitor line health, in-flight batches, and manufacturing bottlenecks in real time."
      activeHref="/admin/production"
      scopeLabel="Admin ERP"
      roleLabel="Manufacturing Control"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/production", label: "Batches", tone: "neutral" },
        { href: "/admin/qr", label: "QR Tags", tone: "neutral" },
        { href: "/admin/orders", label: "Dispatch Sync", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {lineHealth.map((line) => (
          <article key={line.line} className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">{line.line}</p>
            <p className="mt-2 text-2xl font-bold text-[#031E49]">{line.utilization}</p>
            <p className="mt-2 text-sm text-[#0A2D6C]/65">Output: {line.output}</p>
            <p className={`mt-2 text-xs font-semibold ${line.status === "Healthy" ? "text-emerald-600" : "text-amber-600"}`}>{line.status}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Batch Execution Queue</h2>
          <button className="px-3 py-2 rounded-full text-xs font-bold bg-[#031E49] text-white">Create Batch</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB]">
              <tr>
                <th className="px-5 py-3">Batch</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Current Stage</th>
                <th className="px-5 py-3">ETA</th>
                <th className="px-5 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.batch} className="border-t border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                  <td className="px-5 py-3 font-bold text-[#031E49]">{batch.batch}</td>
                  <td className="px-5 py-3 text-[#0A2D6C]/70">{batch.product}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${batch.stage === "QA Hold" ? "bg-amber-100 text-amber-700" : "bg-[#031E49]/8 text-[#031E49]"}`}>
                      {batch.stage}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#0A2D6C]/60">{batch.eta}</td>
                  <td className="px-5 py-3 text-[#031E49] font-medium">{batch.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </OpsShell>
  );
}
