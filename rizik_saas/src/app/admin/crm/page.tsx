import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { getSupportTickets } from "@/lib/ops/data";

const statusTone: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const priorityTone: Record<string, string> = {
  P1: "bg-[#031E49] text-white",
  P2: "bg-amber-100 text-amber-700",
  P3: "bg-[#031E49]/8 text-[#031E49]",
};

export default async function AdminCRMPage() {
  const tickets = await getSupportTickets(80);

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
        { href: "/admin/notifications", label: "SLA Alerts", tone: "primary" },
      ]}
    >
      <section className="rounded-3xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Live Ticket Queue</h2>
          <span className="px-2 py-1 text-[10px] rounded-full bg-[#00B16A] text-white font-bold">{tickets.length} Active</span>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 text-sm text-[#0A2D6C]/65">No support tickets found.</div>
        ) : (
          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#031E49]">{ticket.topic}</p>
                    <p className="text-xs text-[#0A2D6C]/60 mt-0.5">{ticket.customer_name} · {ticket.account_type}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityTone[ticket.priority] || "bg-gray-100 text-gray-700"}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#0A2D6C]/70">{ticket.latest_request || "No message"}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusTone[ticket.status] || "bg-gray-100 text-gray-700"}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-[#031E49]/55">{ticket.assigned_team || "Unassigned"}</span>
                </div>
                <p className="mt-2 text-[11px] text-[#0A2D6C]/50">
                  {ticket.ticket_code} · {new Date(ticket.updated_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </OpsShell>
  );
}
