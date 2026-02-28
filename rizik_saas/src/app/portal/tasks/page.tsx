"use client";

import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems } from "@/lib/workspace/nav";

const todo = [
  { task: "Confirm shipment docs for Noor Holdings", owner: "Logistics", due: "11:00" },
  { task: "Upload QA evidence for batch RB-PRD-2203", owner: "Production", due: "12:15" },
  { task: "Reply to enterprise escalation thread", owner: "Support", due: "13:00" },
];

const doing = [
  { task: "Finalize warehouse picklist", owner: "Supply", due: "In progress" },
  { task: "Cross-check SKU shortage with catalog", owner: "Inventory", due: "In progress" },
];

const done = [
  { task: "Morning shift attendance lock", owner: "People Ops", due: "09:00" },
  { task: "Dispatch slot approval", owner: "Admin", due: "09:20" },
];

export default function PortalTasksPage() {
  return (
    <OpsShell
      title="My Tasks"
      subtitle="Daily execution board across support, logistics, and production operations."
      activeHref="/portal/tasks"
      scopeLabel="Employee Portal"
      roleLabel="Task Execution"
      navItems={portalNavItems}
      quickLinks={[
        { href: "/portal/tasks", label: "Board", tone: "neutral" },
        { href: "/portal/requests", label: "Requests", tone: "neutral" },
        { href: "/portal", label: "Overview", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <TaskColumn title="To Do" tone="border-[#031E49]/15 bg-white" items={todo} />
        <TaskColumn title="In Progress" tone="border-[#031E49]/15 bg-white" items={doing} />
        <TaskColumn title="Completed" tone="border-[#031E49]/15 bg-white" items={done} />
      </section>
    </OpsShell>
  );
}

function TaskColumn({ title, items, tone }: { title: string; items: { task: string; owner: string; due: string }[]; tone: string }) {
  return (
    <article className={`rounded-2xl border ${tone} p-4 shadow-sm`}>
      <h2 className="text-sm font-bold text-[#031E49] mb-3">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.task} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 p-3">
            <p className="text-sm font-semibold text-[#031E49]">{item.task}</p>
            <p className="mt-1 text-xs text-[#0A2D6C]/60">Owner: {item.owner} · Due: {item.due}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
