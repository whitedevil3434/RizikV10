"use client";

import { useMemo, useState } from "react";
import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

type OrderType = "B2B" | "B2C";

const orders = [
  { id: "#RB-8408", customer: "Noor Holdings", type: "B2B" as OrderType, product: "Bio-Shield Retort x8,000", status: "MANUFACTURING", value: "৳ 680,000", sla: "On Track", date: "2026-02-28" },
  { id: "#RB-8407", customer: "Green Agro Chain", type: "B2B" as OrderType, product: "Vegetable Matrix x12,000", status: "QA_CHECK", value: "৳ 300,000", sla: "Watch", date: "2026-02-28" },
  { id: "#RB-8406", customer: "Al-Hikmah Mosque", type: "B2B" as OrderType, product: "Glow Mats x1,200", status: "SHIPPED", value: "৳ 108,000", sla: "On Track", date: "2026-02-27" },
  { id: "#RB-8405", customer: "Mahi Uddin", type: "B2C" as OrderType, product: "Eco-Mat Oud Edition", status: "DELIVERED", value: "৳ 120", sla: "Closed", date: "2026-02-27" },
  { id: "#RB-8404", customer: "Pran Agro Ltd.", type: "B2B" as OrderType, product: "Raw Spice Pouch x5,000", status: "PENDING", value: "৳ 225,000", sla: "Risk", date: "2026-02-26" },
  { id: "#RB-8403", customer: "Sadia Rahman", type: "B2C" as OrderType, product: "Classic Eco-Mat", status: "SHIPPED", value: "৳ 50", sla: "On Track", date: "2026-02-26" },
];

const statusTone: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  MANUFACTURING: "bg-blue-100 text-blue-700",
  QA_CHECK: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
};

const slaTone: Record<string, string> = {
  "On Track": "text-emerald-600",
  Watch: "text-amber-600",
  Risk: "text-red-600",
  Closed: "text-[#031E49]/40",
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<"ALL" | OrderType>("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter((order) => order.type === filter);
  }, [filter]);

  return (
    <OpsShell
      title="Logistics & Orders"
      subtitle="Track enterprise shipments, retail orders, SLAs, and fulfillment exceptions from one surface."
      activeHref="/admin/orders"
      scopeLabel="Admin ERP"
      roleLabel="Logistics Command"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/orders", label: "All Orders", tone: "neutral" },
        { href: "/admin/inventory", label: "Inventory", tone: "neutral" },
        { href: "/admin/production", label: "Production", tone: "primary" },
      ]}
    >
      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex flex-wrap gap-2 items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Unified Order Queue</h2>
          <div className="flex items-center gap-2">
            {(["ALL", "B2B", "B2C"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  filter === item
                    ? "bg-[#031E49] text-white"
                    : "bg-[#F5F2EB] text-[#031E49]/65 border border-[#031E49]/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="md:hidden p-4 space-y-3">
          {filtered.map((order) => (
            <article key={order.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#031E49]">{order.id}</p>
                  <p className="text-xs text-[#0A2D6C]/75 mt-0.5">{order.customer}</p>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${order.type === "B2B" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                  {order.type}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#031E49]">{order.product}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusTone[order.status] || "bg-gray-100 text-gray-700"}`}>
                  {order.status.replace("_", " ")}
                </span>
                <span className={`text-xs font-semibold ${slaTone[order.sla] || "text-[#031E49]/60"}`}>{order.sla}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-[#0A2D6C]/60">{order.date}</p>
                <p className="text-sm font-bold text-[#031E49]">{order.value}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB]">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Channel</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">SLA</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                  <td className="px-5 py-3 font-bold text-[#031E49]">{order.id}</td>
                  <td className="px-5 py-3 text-[#0A2D6C]/75">{order.customer}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${order.type === "B2B" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                      {order.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#031E49]">{order.product}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusTone[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-xs font-semibold ${slaTone[order.sla] || "text-[#031E49]/60"}`}>{order.sla}</td>
                  <td className="px-5 py-3 text-xs text-[#0A2D6C]/55">{order.date}</td>
                  <td className="px-5 py-3 text-right font-semibold text-[#031E49]">{order.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </OpsShell>
  );
}
