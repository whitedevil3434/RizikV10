import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems } from "@/lib/workspace/nav";
import { getOpsRequests } from "@/lib/ops/data";

const statusTone: Record<string, string> = {
  APPROVAL_PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  NEEDS_INFO: "bg-[#031E49]/10 text-[#031E49]",
  CLOSED: "bg-[#031E49]/10 text-[#031E49]",
};

export default async function PortalRequestsPage() {
  const requests = await getOpsRequests(80);

  return (
    <OpsShell
      title="Request Center"
      subtitle="Submit operational requests and track approvals without leaving the employee workspace."
      activeHref="/portal/requests"
      scopeLabel="Employee Portal"
      roleLabel="Approval Workflow"
      navItems={portalNavItems}
      quickLinks={[
        { href: "/portal/requests", label: "Requests", tone: "neutral" },
        { href: "/portal/tasks", label: "Tasks", tone: "neutral" },
        { href: "/portal/logistics", label: "Logistics", tone: "primary" },
      ]}
    >
      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Operational Requests</h2>
          <p className="text-xs text-[#0A2D6C]/55">{requests.length} records</p>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-sm text-[#0A2D6C]/65">No request records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB]">
                <tr>
                  <th className="px-5 py-3">Request ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Owner Team</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                    <td className="px-5 py-3 font-semibold text-[#031E49]">{request.request_code}</td>
                    <td className="px-5 py-3 text-[#0A2D6C]/70">{request.request_type}</td>
                    <td className="px-5 py-3 text-[#0A2D6C]/70">{request.owner_team || "Ops"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusTone[request.status] || "bg-gray-100 text-gray-700"}`}>
                        {request.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#0A2D6C]/55">
                      {new Date(request.updated_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </OpsShell>
  );
}
