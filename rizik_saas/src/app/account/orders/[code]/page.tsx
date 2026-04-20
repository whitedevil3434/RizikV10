import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function OrderTrackingPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("rizik_order_records")
        .select("*")
        .eq("order_code", code);

    const orders = (data || []) as Array<{
        order_code: string; product_sku: string; quantity: number;
        unit_price_bdt: number; customer_name: string; status: string; created_at: string;
    }>;

    if (error || orders.length === 0) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-4">
                <div className="text-center rounded-2xl border border-[#031E49]/10 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">Order Not Found</h1>
                    <p className="text-sm text-[#0A2D6C]/50 mb-4">No order found with code: {code}</p>
                    <Link href="/account" className="text-[#00B16A] font-bold hover:text-emerald-700">Back to Account</Link>
                </div>
            </div>
        );
    }

    const order = orders[0];
    const total = orders.reduce((s, o) => s + o.quantity * o.unit_price_bdt, 0);

    const timeline = [
        { step: "Confirmed", done: true },
        { step: "Manufacturing", done: ["MANUFACTURING", "SHIPPED", "DELIVERED"].includes(order.status) },
        { step: "Shipped", done: ["SHIPPED", "DELIVERED"].includes(order.status) },
        { step: "Delivered", done: order.status === "DELIVERED" },
    ];

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <nav className="mb-6 text-sm flex items-center gap-2">
                    <Link href="/account" className="text-[#00B16A] font-semibold hover:text-emerald-700">Account</Link>
                    <span className="text-[#031E49]/30">/</span>
                    <span className="text-[#031E49]/50">Order {code}</span>
                </nav>

                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-lg overflow-hidden">
                    <div className="bg-[#031E49] text-white px-8 py-6">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-white/60 mb-1">ORDER TRACKING</p>
                        <h1 className="text-2xl font-bold font-mono">{code}</h1>
                        <p className="text-sm text-white/60 mt-1">Placed {new Date(order.created_at).toLocaleDateString("en-GB")}</p>
                    </div>

                    {/* Timeline */}
                    <div className="px-8 py-8">
                        <div className="flex items-center justify-between mb-8">
                            {timeline.map((t, i) => (
                                <div key={t.step} className="flex items-center gap-0 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.done ? "bg-[#00B16A] text-white" : "bg-[#031E49]/10 text-[#031E49]/40"}`}>
                                        {t.done ? "✓" : i + 1}
                                    </div>
                                    {i < timeline.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-1 ${t.done ? "bg-[#00B16A]" : "bg-[#031E49]/10"}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#0A2D6C]/50 -mt-4 mb-6">
                            {timeline.map(t => <span key={t.step} className={t.done ? "text-[#031E49] font-semibold" : ""}>{t.step}</span>)}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="px-8 pb-8">
                        <h2 className="text-sm font-bold text-[#031E49] mb-3">Order Items</h2>
                        <div className="rounded-xl border border-[#031E49]/10 divide-y divide-[#031E49]/8">
                            {orders.map((o, i) => (
                                <div key={i} className="px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-mono font-bold text-[#031E49]">{o.product_sku}</p>
                                        <p className="text-xs text-[#0A2D6C]/50">Qty: {o.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-[#031E49]">৳{Math.round(o.quantity * o.unit_price_bdt).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right">
                            <p className="text-xs text-[#0A2D6C]/50">Total</p>
                            <p className="text-xl font-bold text-[#031E49]">৳{Math.round(total).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
