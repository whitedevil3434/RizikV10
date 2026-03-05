import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems } from "@/lib/workspace/nav";
import { getShipments } from "@/lib/ops/data";

const statusTone: Record<string, string> = {
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-emerald-100 text-emerald-700",
  READY_FOR_PICKUP: "bg-[#031E49]/10 text-[#031E49]",
  HOLD: "bg-amber-100 text-amber-700",
  DELAYED: "bg-red-100 text-red-700",
};

export default async function PortalLogisticsPage() {
  const shipments = await getShipments(80);

  return (
    <OpsShell
      title="Logistics Visibility"
      subtitle="Follow shipment movement, route ETA, and exception flags from the employee portal."
      activeHref="/portal/logistics"
      scopeLabel="Employee Portal"
      roleLabel="Dispatch Monitoring"
      navItems={portalNavItems}
      quickLinks={[
        { href: "/portal/logistics", label: "Shipments", tone: "neutral" },
        { href: "/portal/requests", label: "Requests", tone: "neutral" },
        { href: "/portal/notifications", label: "Alerts", tone: "primary" },
      ]}
    >
      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Shipment Board</h2>
          <p className="text-xs text-[#0A2D6C]/55">{shipments.length} records</p>
        </div>

        {shipments.length === 0 ? (
          <div className="p-8 text-sm text-[#0A2D6C]/65">No shipment records found.</div>
        ) : (
          <>
            <div className="md:hidden p-4 space-y-3">
              {shipments.map((shipment) => (
                <article key={shipment.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#031E49]">{shipment.shipment_code}</p>
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusTone[shipment.status] || "bg-gray-100 text-gray-700"}`}>
                      {shipment.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#031E49]">{shipment.route_text}</p>
                  <p className="mt-1 text-xs text-[#0A2D6C]/70">{shipment.customer_name}</p>
                  <p className="mt-3 text-[11px] text-[#0A2D6C]/60">
                    ETA: {shipment.eta_at ? new Date(shipment.eta_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : "-"}
                  </p>
                </article>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB]">
                  <tr>
                    <th className="px-5 py-3">Shipment</th>
                    <th className="px-5 py-3">Route</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="border-t border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                      <td className="px-5 py-3 font-semibold text-[#031E49]">{shipment.shipment_code}</td>
                      <td className="px-5 py-3 text-[#0A2D6C]/70">{shipment.route_text}</td>
                      <td className="px-5 py-3 text-[#0A2D6C]/70">{shipment.customer_name}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusTone[shipment.status] || "bg-gray-100 text-gray-700"}`}>
                          {shipment.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#0A2D6C]/55">
                        {shipment.eta_at ? new Date(shipment.eta_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </OpsShell>
  );
}
