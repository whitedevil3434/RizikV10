"use client";

import Link from "next/link";
import { ClipboardDocumentCheckIcon, ClockIcon, TruckIcon, UserGroupIcon, BoltIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems } from "@/lib/workspace/nav";

const kpis = [
  { label: "Assigned Tasks", value: "17", hint: "4 high priority" },
  { label: "Open Requests", value: "9", hint: "2 awaiting approval" },
  { label: "Active Shipments", value: "23", hint: "5 in final mile" },
  { label: "Team Availability", value: "92%", hint: "Morning shift" },
];

const feeds = [
  { time: "09:05", title: "Production handoff confirmed", detail: "Batch RB-PRD-2203 moved to logistics queue." },
  { time: "09:30", title: "Support escalation created", detail: "Enterprise account requested expedited dispatch." },
  { time: "10:10", title: "Stock threshold warning", detail: "Classic Eco-Mat nearing reorder level." },
];

const quickModules = [
  { href: "/portal/tasks", label: "Task Board", desc: "Track daily assignments", icon: ClipboardDocumentCheckIcon },
  { href: "/portal/requests", label: "Request Center", desc: "Submit and approve ops requests", icon: ClockIcon },
  { href: "/portal/logistics", label: "Logistics View", desc: "See shipment pipeline", icon: TruckIcon },
  { href: "/portal/knowledge", label: "Knowledge Base", desc: "SOP and policy docs", icon: UserGroupIcon },
  { href: "/fair/dashboard", label: "Fair Dashboard", desc: "Monitor fair tasks and department race", icon: BoltIcon },
  { href: "/community", label: "Community Feed", desc: "Review member posts and engagement", icon: ChatBubbleLeftRightIcon },
];

export default function PortalPage() {
  return (
    <OpsShell
      title="Employee Operations Portal"
      subtitle="Single workspace for daily task execution, cross-team coordination, and operations visibility."
      activeHref="/portal"
      scopeLabel="Employee Portal"
      roleLabel="Team Workspace"
      navItems={portalNavItems}
      quickLinks={[
        { href: "/portal/tasks", label: "Tasks", tone: "neutral" },
        { href: "/portal/requests", label: "Requests", tone: "neutral" },
        { href: "/fair/dashboard", label: "Fair", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {kpis.map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#031E49]">{item.value}</p>
            <p className="mt-2 text-xs text-[#0A2D6C]/55">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-7">
        <article className="xl:col-span-2 rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49] mb-4">Operations Feed</h2>
          <div className="space-y-3">
            {feeds.map((feed) => (
              <div key={feed.title} className="rounded-xl border border-[#031E49]/8 bg-[#F5F2EB]/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#031E49]">{feed.title}</p>
                  <span className="text-[11px] font-semibold text-[#031E49]/50">{feed.time}</span>
                </div>
                <p className="mt-1 text-sm text-[#0A2D6C]/60">{feed.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-gradient-to-br from-[#031E49] to-[#0A2D6C] text-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 font-semibold">Daily Mission</p>
          <h3 className="mt-3 text-xl font-bold">Fast Coordination, Zero Confusion</h3>
          <p className="mt-3 text-sm text-white/75 leading-relaxed">
            Employee and admin collaboration follows one operational language with accountable modules and auditable actions.
          </p>
          <Link href="/portal/tasks" className="mt-6 inline-flex px-4 py-2 rounded-full bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
            Open My Tasks
          </Link>
        </article>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#031E49] mb-4">All Employee Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickModules.map((module) => (
            <Link key={module.href} href={module.href} className="group rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="h-10 w-10 rounded-xl bg-[#031E49]/10 text-[#031E49] flex items-center justify-center">
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
