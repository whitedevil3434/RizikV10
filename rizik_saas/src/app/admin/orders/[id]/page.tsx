import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { getOrderById } from "@/lib/ops/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import OrderStatusUpdater from "./OrderStatusUpdater";

const statusTone: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    MANUFACTURING: "bg-indigo-100 text-indigo-700 border-indigo-200",
    QA_CHECK: "bg-purple-100 text-purple-700 border-purple-200",
    SHIPPED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

const slaTone: Record<string, string> = {
    ON_TRACK: "text-emerald-600",
    WATCH: "text-amber-600",
    RISK: "text-red-600",
    CLOSED: "text-[#031E49]/40",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }

    const value = order.quantity * order.unit_price_bdt;

    return (
        <OpsShell
            title={`Order #${order.order_code}`}
            subtitle={`Managing order for ${order.customer_name}`}
            activeHref="/admin/orders"
            scopeLabel="Admin ERP"
            roleLabel="Order Detail"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/orders", label: "← All Orders", tone: "neutral" },
                { href: "/admin/inventory", label: "Inventory", tone: "neutral" },
            ]}
        >
            {/* Order Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[#031E49]">Order Information</h2>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusTone[order.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                {order.status.replace(/_/g, " ")}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Order Code</p>
                                <p className="text-sm font-bold text-[#031E49]">#{order.order_code}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Customer</p>
                                <p className="text-sm font-bold text-[#031E49]">{order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Channel</p>
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${order.channel === "B2B" ? "bg-[#031E49] text-white" : "bg-[#00B16A] text-white"}`}>
                                    {order.channel}
                                </span>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Product SKU</p>
                                <p className="text-sm text-[#031E49]">{order.product_sku || "—"}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Quantity</p>
                                <p className="text-sm font-bold text-[#031E49]">{order.quantity.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Unit Price</p>
                                <p className="text-sm text-[#031E49]">৳{order.unit_price_bdt.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Order Total</p>
                                <p className="text-lg font-bold text-[#031E49]">৳{value.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">SLA State</p>
                                <p className={`text-sm font-bold ${slaTone[order.sla_state] || "text-[#031E49]/60"}`}>{order.sla_state}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Created</p>
                                <p className="text-sm text-[#031E49]">
                                    {new Date(order.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                            </div>
                            {order.expected_delivery_at && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.06em] text-[#0A2D6C]/50 font-semibold mb-1">Expected Delivery</p>
                                    <p className="text-sm text-[#031E49]">
                                        {new Date(order.expected_delivery_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Action Sidebar */}
                <div className="space-y-6">
                    {/* Status Update */}
                    <OrderStatusUpdater orderId={order.id} currentStatus={order.status} currentSla={order.sla_state} />

                    {/* Back Link */}
                    <Link
                        href="/admin/orders"
                        className="block w-full text-center text-sm text-[#00B16A] font-semibold hover:text-emerald-700 py-3"
                    >
                        ← Back to All Orders
                    </Link>
                </div>
            </div>
        </OpsShell>
    );
}
