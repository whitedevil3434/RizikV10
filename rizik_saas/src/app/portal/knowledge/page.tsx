"use client";

import Link from "next/link";
import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems } from "@/lib/workspace/nav";

const docs = [
  { title: "Dispatch SOP v3.2", section: "Logistics", updated: "2026-02-22" },
  { title: "Support Escalation Matrix", section: "Customer Success", updated: "2026-02-20" },
  { title: "Batch QA Checklist", section: "Production", updated: "2026-02-18" },
  { title: "B2B Client Onboarding Playbook", section: "Commercial", updated: "2026-02-16" },
  { title: "Warehouse Receiving Protocol", section: "Supply Chain", updated: "2026-02-12" },
];

export default function PortalKnowledgePage() {
  return (
    <OpsShell
      title="Knowledge Base"
      subtitle="Access SOPs, onboarding playbooks, and operational references for consistent execution."
      activeHref="/portal/knowledge"
      scopeLabel="Employee Portal"
      roleLabel="Documentation"
      navItems={portalNavItems}
      quickLinks={[
        { href: "/portal/knowledge", label: "SOP", tone: "neutral" },
        { href: "/portal/tasks", label: "Tasks", tone: "neutral" },
        { href: "/portal", label: "Overview", tone: "primary" },
      ]}
    >
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <article className="xl:col-span-2 rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#031E49]/10">
            <h2 className="text-base font-bold text-[#031E49]">Operational Documents</h2>
          </div>
          <div className="divide-y divide-[#031E49]/8">
            {docs.map((doc) => (
              <div key={doc.title} className="px-5 py-4 hover:bg-[#F5F2EB]/40">
                <p className="text-sm font-semibold text-[#031E49]">{doc.title}</p>
                <p className="mt-1 text-xs text-[#0A2D6C]/60">{doc.section} · Updated: {doc.updated}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#031E49]/10 bg-[#031E49] text-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 font-semibold">Access Control</p>
          <h3 className="mt-3 text-xl font-bold">Need New Document?</h3>
          <p className="mt-3 text-sm text-white/75 leading-relaxed">
            Team-specific policies or training materials can be requested through the request center.
          </p>
          <Link href="/portal/requests" className="mt-5 inline-flex px-4 py-2 rounded-full bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
            Request Document Update
          </Link>
        </article>
      </section>
    </OpsShell>
  );
}
