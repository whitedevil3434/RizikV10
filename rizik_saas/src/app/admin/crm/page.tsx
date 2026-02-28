"use client";

import { useMemo, useState } from "react";
import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

type Ticket = {
  id: number;
  customer: string;
  accountType: "B2B" | "B2C";
  topic: string;
  status: TicketStatus;
  priority: "P1" | "P2" | "P3";
  latestReq: string;
};

const tickets: Ticket[] = [
  { id: 1, customer: "Noor Holdings", accountType: "B2B", topic: "Dispatch window mismatch", status: "OPEN", priority: "P1", latestReq: "Need confirmed truck ETA before 14:00." },
  { id: 2, customer: "Pran Agro Ltd.", accountType: "B2B", topic: "MOQ pricing clarification", status: "IN_PROGRESS", priority: "P2", latestReq: "Share tier pricing for 50,000 pouches." },
  { id: 3, customer: "Amina Jahan", accountType: "B2C", topic: "Order replacement request", status: "OPEN", priority: "P2", latestReq: "Requesting exchange for damaged retail unit." },
  { id: 4, customer: "Rahim Group", accountType: "B2B", topic: "Compliance document request", status: "RESOLVED", priority: "P3", latestReq: "Documents received. Thank you." },
];

const statusTone: Record<TicketStatus, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const priorityTone: Record<Ticket["priority"], string> = {
  P1: "bg-[#031E49] text-white",
  P2: "bg-amber-100 text-amber-700",
  P3: "bg-[#031E49]/8 text-[#031E49]",
};

export default function AdminCRMPage() {
  const [activeTicketId, setActiveTicketId] = useState(1);

  const activeTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === activeTicketId) || tickets[0],
    [activeTicketId]
  );

  return (
    <OpsShell
      title="Support CRM"
      subtitle="Centralize ticket triage, enterprise communication, and escalation tracking for all channels."
      activeHref="/admin/crm"
      scopeLabel="Admin ERP"
      roleLabel="Support Operations"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/crm", label: "Tickets", tone: "neutral" },
        { href: "/admin/team", label: "Agents", tone: "neutral" },
        { href: "/admin/analytics", label: "SLA Insights", tone: "primary" },
      ]}
    >
      <section className="rounded-3xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] min-h-[560px]">
          <aside className="border-r border-[#031E49]/10 bg-[#F5F2EB]/45">
            <div className="px-4 py-4 border-b border-[#031E49]/10 bg-white flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#031E49]">Live Ticket Queue</h2>
              <span className="px-2 py-1 text-[10px] rounded-full bg-[#00B16A] text-white font-bold">{tickets.length} Active</span>
            </div>

            <div className="max-h-[510px] overflow-y-auto">
              {tickets.map((ticket) => {
                const isActive = activeTicketId === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`w-full text-left px-4 py-4 border-b border-[#031E49]/8 transition-colors ${
                      isActive ? "bg-white border-l-4 border-l-[#031E49]" : "hover:bg-white/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#031E49] truncate">{ticket.customer}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityTone[ticket.priority]}`}>{ticket.priority}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#0A2D6C]/70 font-semibold">{ticket.topic}</p>
                    <p className="mt-1 text-xs text-[#0A2D6C]/50 truncate">{ticket.latestReq}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusTone[ticket.status]}`}>{ticket.status.replace("_", " ")}</span>
                      <span className="text-[10px] text-[#031E49]/45 font-semibold">{ticket.accountType}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="flex flex-col">
            <header className="px-6 py-5 border-b border-[#031E49]/10 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">Ticket #{activeTicket.id}</p>
                <h3 className="text-xl font-bold text-[#031E49]">{activeTicket.topic}</h3>
                <p className="text-sm text-[#0A2D6C]/60">{activeTicket.customer} · {activeTicket.accountType}</p>
              </div>
              <button className="px-4 py-2 rounded-full bg-[#031E49] text-white text-xs font-bold hover:bg-[#0A2D6C]">
                Mark As Resolved
              </button>
            </header>

            <div className="flex-1 px-6 py-6 bg-[#F5F2EB]/30 space-y-5">
              <div className="max-w-2xl rounded-2xl border border-[#031E49]/10 bg-white p-4">
                <p className="text-xs font-semibold text-[#031E49]/55">Customer Message</p>
                <p className="mt-2 text-sm text-[#031E49]">{activeTicket.latestReq}</p>
              </div>
              <div className="ml-auto max-w-2xl rounded-2xl border border-[#031E49]/20 bg-[#031E49] p-4 text-white">
                <p className="text-xs font-semibold text-white/60">Support Response Draft</p>
                <p className="mt-2 text-sm">
                  Thank you for the update. Our operations team is reviewing this request and will confirm the final action window within the next business checkpoint.
                </p>
              </div>
            </div>

            <footer className="px-6 py-4 border-t border-[#031E49]/10 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Write operational response..."
                  className="flex-1 rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/25"
                />
                <button className="px-4 py-3 rounded-xl bg-[#00B16A] text-white text-sm font-bold hover:bg-emerald-600">
                  Send
                </button>
              </div>
            </footer>
          </article>
        </div>
      </section>
    </OpsShell>
  );
}
