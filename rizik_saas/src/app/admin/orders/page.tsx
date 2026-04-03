import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { getOrders } from "@/lib/ops/data";
import Link from "next/link";

import ApproveCreditsButton from "@/components/workspace/ApproveCreditsButton";

const statusTone: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  MANUFACTURING: "bg-blue-100 text-blue-700",
  QA_CHECK: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const slaTone: Record<string, string> = {
  ON_TRACK: "text-emerald-600",
  WATCH: "text-amber-600",
  RISK: "text-red-600",
  CLOSED: "text-[#031E49]/40",
};

export default async function AdminOrdersPage() {
  const orders = await getOrders(120);

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
        { href: "/admin/notifications", label: "Alerts", tone: "primary" },
      ]}
    >
      <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#031E49]">Unified Order Queue</h2>
          <p className="text-xs text-[#0A2D6C]/55">{orders.length} records</p>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-sm text-[#0A2D6C]/65">No order records available.</div>
        ) : (
          <>
            <div className="md:hidden p-4 space-y-3">
              {orders.map((order) => {
                const value = order.quantity * order.unit_price_bdt;
                return (
                  <Link href={`/admin/orders/${order.id}`} key={order.id} className="block rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4 hover:bg-white transition-colors cursor-pointer">
                    <article>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#031E49]">#{order.order_code}</p>
                          <p className="text-xs text-[#0A2D6C]/75 mt-0.5">{order.customer_name}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          order.channel === "B2B" ? "bg-[#031E49] text-white" : 
                          order.channel === "DIGITAL" ? "bg-[#E2136E] text-white" : "bg-[#00B16A] text-white"
                        }`}>
                          {order.channel}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#031E49]">{order.product_sku || "Unassigned product"} x{order.quantity}</p>
                      
                      {order.trxid && (
                        <p className="text-[10px] text-[#E2136E] font-bold mt-1 tracking-wider uppercase">TRXID: {order.trxid}</p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusTone[order.status] || "bg-gray-100 text-gray-700"}`}>
                            {order.status.replace("_", " ")}
                          </span>
                          {order.channel === "DIGITAL" && order.status === "PENDING" && (
                            <ApproveCreditsButton orderId={order.id} orderCode={order.order_code} />
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${slaTone[order.sla_state] || "text-[#031E49]/60"}`}>{order.sla_state}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[11px] text-[#0A2D6C]/60">
                          {new Date(order.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}
                        </p>
                        <p className="text-sm font-bold text-[#031E49]">৳{value.toLocaleString()}</p>
                      </div>
                    </article>
                  </Link>
                );
              })}
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
                  {orders.map((order) => {
                    const value = order.quantity * order.unit_price_bdt;
                    return (
                      <tr key={order.id} className="border-t border-[#031E49]/8 hover:bg-[#F5F2EB]/80 cursor-pointer overflow-hidden group">
                        <td colSpan={8} className="p-0">
                          <div className="flex w-full items-center">
                            <div className="flex-1 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center text-left text-sm whitespace-nowrap px-5 py-3">
                              <Link href={`/admin/orders/${order.id}`} className="font-bold text-[#031E49]">
                                #{order.order_code}
                              </Link>
                              <span className="text-[#0A2D6C]/75">{order.customer_name}</span>
                              <span>
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                  order.channel === "B2B" ? "bg-[#031E49] text-white" : 
                                  order.channel === "DIGITAL" ? "bg-[#E2136E] text-white" : "bg-[#00B16A] text-white"
                                }`}>
                                  {order.channel}
                                </span>
                              </span>
                              <div className="flex flex-col">
                                <span className="text-[#031E49] truncate">{order.product_sku || "-"} x{order.quantity}</span>
                                {order.trxid && (
                                  <span className="text-[10px] text-[#E2136E] font-bold tracking-tight uppercase">{order.trxid}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusTone[order.status] || "bg-gray-100 text-gray-700"}`}>
                                  {order.status.replace("_", " ")}
                                </span>
                                {order.channel === "DIGITAL" && order.status === "PENDING" && (
                                  <ApproveCreditsButton orderId={order.id} orderCode={order.order_code} />
                                )}
                              </div>
                              <span className={`text-xs font-semibold ${slaTone[order.sla_state] || "text-[#031E49]/60"}`}>{order.sla_state}</span>
                              <span className="text-xs text-[#0A2D6C]/55">
                                {new Date(order.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}
                              </span>
                              <span className="text-right font-semibold text-[#031E49]">৳{value.toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </OpsShell>
  );
}
