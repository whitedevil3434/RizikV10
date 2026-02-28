"use client";

import Link from "next/link";
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  QrCodeIcon,
  RectangleStackIcon,
  TruckIcon,
  UserGroupIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

const stats = [
  { label: "Revenue (MTD)", value: "৳ 2.4M", delta: "+18%" },
  { label: "Active Orders", value: "142", delta: "+7 today" },
  { label: "Open Tickets", value: "12", delta: "3 urgent" },
  { label: "Line Utilization", value: "88%", delta: "Stable" },
];

const modules = [
  { href: "/admin/orders", label: "Orders", desc: "B2B and B2C fulfillment pipeline", icon: TruckIcon, tone: "bg-blue-50 text-blue-700" },
  { href: "/admin/products", label: "Products", desc: "Catalog, pricing, and lifecycle control", icon: CubeIcon, tone: "bg-emerald-50 text-emerald-700" },
  { href: "/admin/crm", label: "Support CRM", desc: "Customer ticket and escalation desk", icon: ChatBubbleLeftRightIcon, tone: "bg-amber-50 text-amber-700" },
  { href: "/admin/production", label: "Production", desc: "Batch execution and line health", icon: WrenchScrewdriverIcon, tone: "bg-fuchsia-50 text-fuchsia-700" },
  { href: "/admin/inventory", label: "Inventory", desc: "Warehouse stock and reorder alerts", icon: RectangleStackIcon, tone: "bg-rose-50 text-rose-700" },
  { href: "/admin/qr", label: "QR Tags", desc: "Traceability label generation", icon: QrCodeIcon, tone: "bg-cyan-50 text-cyan-700" },
  { href: "/admin/fair", label: "Fair Ops", desc: "Campaign onboarding, leaderboard, and task controls", icon: BoltIcon, tone: "bg-lime-50 text-lime-700" },
  { href: "/admin/squads", label: "Squad Ops", desc: "Temporary workforce assignments and squad jobs", icon: UsersIcon, tone: "bg-sky-50 text-sky-700" },
  { href: "/admin/team", label: "Team & RBAC", desc: "Employee access and role governance", icon: UserGroupIcon, tone: "bg-violet-50 text-violet-700" },
  { href: "/admin/analytics", label: "Analytics", desc: "Commercial and operational insights", icon: ChartBarIcon, tone: "bg-teal-50 text-teal-700" },
];

const priorityBoard = [
  { owner: "Production", task: "Close QA checks for batch RB-8406", eta: "11:30", status: "In Progress" },
  { owner: "Logistics", task: "Dispatch Chittagong enterprise lot", eta: "13:00", status: "Queued" },
  { owner: "Support", task: "Resolve priority ticket cluster", eta: "14:15", status: "Attention" },
  { owner: "Fair Ops", task: "Review pending task submissions and scoreboard deltas", eta: "15:15", status: "Review" },
  { owner: "Supply", task: "Confirm next-week resin PO", eta: "16:00", status: "Pending" },
];

export default function AdminDashboard() {
  return (
    <OpsShell
      title="Operations Hub"
      subtitle="Unified control layer for revenue, production, workforce, logistics, and support operations."
      activeHref="/admin"
      scopeLabel="Admin ERP"
      roleLabel="Executive Operations"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/orders", label: "Orders", tone: "neutral" },
        { href: "/admin/fair", label: "Fair Ops", tone: "neutral" },
        { href: "/admin/squads", label: "Squad Ops", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#031E49]">{item.value}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#00B16A]">
              <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
              {item.delta}
            </p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <article className="lg:col-span-2 rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#031E49]">Operational Priority Board</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00B16A]">Live Snapshot</span>
          </div>
          <div className="space-y-3">
            {priorityBoard.map((row) => (
              <div key={row.task} className="rounded-xl border border-[#031E49]/10 p-4 bg-[#F5F2EB]/60">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#031E49]">{row.task}</p>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#031E49]/8 text-[#031E49] font-semibold">{row.status}</span>
                </div>
                <div className="mt-2 text-xs text-[#0A2D6C]/60">Owner: {row.owner} · Target: {row.eta}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-gradient-to-br from-[#031E49] to-[#0A2D6C] p-6 shadow-sm text-white">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 font-semibold">Control Note</p>
          <h3 className="mt-3 text-2xl font-bold">Everything in One Surface</h3>
          <p className="mt-3 text-sm text-white/75 leading-relaxed">
            Admin and employee operations are now aligned in one management surface with clear role boundaries and shared execution data.
          </p>
          <Link href="/admin/squads" className="mt-6 inline-flex px-4 py-2 rounded-full bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
            Open Squad Control
          </Link>
        </article>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#031E49] mb-4">Full Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`h-10 w-10 rounded-xl ${module.tone} flex items-center justify-center`}>
                <module.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#031E49] group-hover:text-[#00B16A]">{module.label}</h3>
              <p className="mt-2 text-sm text-[#0A2D6C]/60">{module.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </OpsShell>
  );
}
