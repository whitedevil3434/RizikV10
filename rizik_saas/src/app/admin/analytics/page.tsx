"use client";

import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenueData = [45000, 62000, 78000, 95000, 110000, 135000, 168000, 192000, 230000, 275000, 320000, 410000];
const ordersData = [12, 18, 24, 31, 38, 45, 56, 63, 75, 89, 102, 128];

const categoryBreakdown = [
  { name: "Eco-Mats", value: 62, color: "#031E49" },
  { name: "Bio-Shield", value: 38, color: "#00B16A" },
];

const topProducts = [
  { name: "Glow Series Mat", sold: 1240, revenue: 186000 },
  { name: "Retort Pouch (1yr)", sold: 890, revenue: 75650 },
  { name: "Oud Infused Mat", sold: 760, revenue: 91200 },
  { name: "Vegetable Membrane", sold: 12500, revenue: 312500 },
  { name: "Classic Mat", sold: 3200, revenue: 160000 },
];

export default function AdminAnalyticsPage() {
  const maxRevenue = Math.max(...revenueData);
  const totalRevenue = revenueData.reduce((sum, value) => sum + value, 0);

  return (
    <OpsShell
      title="Business Analytics"
      subtitle="Commercial, product, and order performance layer for executive review and planning cycles."
      activeHref="/admin/analytics"
      scopeLabel="Admin ERP"
      roleLabel="Executive Insights"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/analytics", label: "KPI", tone: "neutral" },
        { href: "/admin/orders", label: "Orders", tone: "neutral" },
        { href: "/admin/products", label: "Products", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Revenue (YTD)</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">৳{(totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="mt-2 text-xs font-semibold text-[#00B16A]">+31.2% YoY</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Orders (YTD)</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">{ordersData.reduce((sum, value) => sum + value, 0)}</p>
          <p className="mt-2 text-xs font-semibold text-[#00B16A]">+14% throughput</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Average Order Value</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">৳3,205</p>
          <p className="mt-2 text-xs font-semibold text-[#00B16A]">+8% MoM</p>
        </article>
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Active Product Lines</p>
          <p className="mt-2 text-3xl font-bold text-[#031E49]">6</p>
          <p className="mt-2 text-xs font-semibold text-[#031E49]/55">2 strategic categories</p>
        </article>
      </section>

      <section className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm mb-7">
        <h2 className="text-lg font-bold text-[#031E49] mb-5">Monthly Revenue Trend</h2>
        <div className="h-52 flex items-end gap-2">
          {revenueData.map((value, index) => (
            <div key={months[index]} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-[#031E49]/40">৳{(value / 1000).toFixed(0)}k</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#031E49] to-[#0A2D6C] hover:from-[#00B16A] hover:to-emerald-600"
                style={{ height: `${(value / maxRevenue) * 100}%` }}
                title={`${months[index]}: ৳${value.toLocaleString()}`}
              />
              <span className="text-[10px] font-semibold text-[#031E49]/55">{months[index]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#031E49] mb-4">Category Share</h2>
          <div className="space-y-4">
            {categoryBreakdown.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-[#031E49]">{category.name}</span>
                  <span className="font-bold text-[#031E49]">{category.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#F5F2EB] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${category.value}%`, backgroundColor: category.color }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#031E49] mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-3 rounded-xl border border-[#031E49]/8 p-3 bg-[#F5F2EB]/35">
                <span className="h-6 w-6 rounded-full bg-[#031E49]/10 text-[#031E49] text-xs font-bold flex items-center justify-center">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#031E49] truncate">{product.name}</p>
                  <p className="text-xs text-[#0A2D6C]/55">{product.sold.toLocaleString()} units sold</p>
                </div>
                <span className="text-sm font-bold text-[#031E49]">৳{(product.revenue / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </OpsShell>
  );
}
