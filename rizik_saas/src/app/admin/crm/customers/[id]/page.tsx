import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserCircleIcon, ShoppingBagIcon, PhoneIcon, EnvelopeIcon, BuildingStorefrontIcon, TagIcon } from "@heroicons/react/24/outline";

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("rizik_customers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="text-center rounded-2xl border border-[#031E49]/10 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">Customer Not Found</h1>
                    <Link href="/admin/crm/customers" className="text-[#00B16A] font-bold">Back to Directory</Link>
                </div>
            </div>
        );
    }

    const c = data as {
        id: string; name: string; email: string | null; phone: string | null;
        company: string | null; channel: string; total_orders: number;
        total_spent_bdt: number; lifetime_value_bdt: number;
        first_order_at: string | null; last_order_at: string | null;
        tags: string[] | null; notes: string | null; created_at: string;
    };

    // Fetch orders for this customer
    const { data: orders } = await admin
        .from("rizik_order_records")
        .select("order_code, product_sku, quantity, unit_price_bdt, status, created_at")
        .eq("customer_name", c.name)
        .order("created_at", { ascending: false })
        .limit(10);

    const recentOrders = (orders || []) as Array<{
        order_code: string; product_sku: string; quantity: number;
        unit_price_bdt: number; status: string; created_at: string;
    }>;

    // Fetch invoices for this customer
    const { data: invoices } = await admin
        .from("rizik_invoices")
        .select("invoice_number, total_bdt, status, created_at")
        .eq("customer_name", c.name)
        .order("created_at", { ascending: false })
        .limit(5);

    const recentInvoices = (invoices || []) as Array<{
        invoice_number: string; total_bdt: number; status: string; created_at: string;
    }>;

    function formatBDT(n: number) {
        if (n >= 1000000) return `৳${(n / 1000000).toFixed(2)}M`;
        if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
        return `৳${Math.round(n).toLocaleString()}`;
    }

    const statusColor: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700", CONFIRMED: "bg-blue-100 text-blue-700",
        SHIPPED: "bg-cyan-100 text-cyan-700", DELIVERED: "bg-emerald-100 text-emerald-700",
        CANCELLED: "bg-red-100 text-red-700", PAID: "bg-emerald-100 text-emerald-700",
        SENT: "bg-blue-100 text-blue-700", OVERDUE: "bg-red-100 text-red-700",
        DRAFT: "bg-gray-100 text-gray-700",
    };

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm flex items-center gap-2">
                    <Link href="/admin/crm" className="text-[#00B16A] font-semibold hover:text-emerald-700">CRM</Link>
                    <span className="text-[#031E49]/30">/</span>
                    <Link href="/admin/crm/customers" className="text-[#00B16A] font-semibold hover:text-emerald-700">Customers</Link>
                    <span className="text-[#031E49]/30">/</span>
                    <span className="text-[#031E49]/50">{c.name}</span>
                </nav>

                {/* Header Card */}
                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-lg overflow-hidden mb-6">
                    <div className="bg-[#031E49] text-white px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                                <UserCircleIcon className="w-8 h-8 text-white/80" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{c.name}</h1>
                                <p className="text-sm text-white/60">{c.company || "Individual Customer"}</p>
                            </div>
                            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${c.channel === "B2B" ? "bg-white text-[#031E49]" : "bg-[#00B16A] text-white"}`}>
                                {c.channel}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#031E49]/10 text-center">
                        <div className="p-5">
                            <p className="text-[11px] uppercase text-[#0A2D6C]/50 mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-[#031E49]">{c.total_orders}</p>
                        </div>
                        <div className="p-5">
                            <p className="text-[11px] uppercase text-[#0A2D6C]/50 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-[#031E49]">{formatBDT(c.total_spent_bdt)}</p>
                        </div>
                        <div className="p-5">
                            <p className="text-[11px] uppercase text-[#0A2D6C]/50 mb-1">Lifetime Value</p>
                            <p className="text-2xl font-bold text-[#00B16A]">{formatBDT(c.lifetime_value_bdt)}</p>
                        </div>
                        <div className="p-5">
                            <p className="text-[11px] uppercase text-[#0A2D6C]/50 mb-1">Member Since</p>
                            <p className="text-lg font-bold text-[#031E49]">{new Date(c.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 p-6 shadow-sm">
                        <h2 className="text-base font-bold text-[#031E49] mb-4">Contact Info</h2>
                        <div className="space-y-3">
                            {c.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <EnvelopeIcon className="w-4 h-4 text-[#0A2D6C]/50" />
                                    <span className="text-[#031E49]">{c.email}</span>
                                </div>
                            )}
                            {c.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <PhoneIcon className="w-4 h-4 text-[#0A2D6C]/50" />
                                    <span className="text-[#031E49]">{c.phone}</span>
                                </div>
                            )}
                            {c.company && (
                                <div className="flex items-center gap-3 text-sm">
                                    <BuildingStorefrontIcon className="w-4 h-4 text-[#0A2D6C]/50" />
                                    <span className="text-[#031E49]">{c.company}</span>
                                </div>
                            )}
                        </div>
                        {(c.tags && c.tags.length > 0) && (
                            <div className="mt-4 pt-4 border-t border-[#031E49]/10">
                                <div className="flex items-center gap-2 mb-2 text-xs text-[#0A2D6C]/50">
                                    <TagIcon className="w-3.5 h-3.5" /> TAGS
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.tags.map(t => (
                                        <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#031E49]/10 text-[#031E49]/70">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {c.notes && (
                            <div className="mt-4 pt-4 border-t border-[#031E49]/10">
                                <p className="text-xs text-[#0A2D6C]/50 mb-1">Notes</p>
                                <p className="text-sm text-[#031E49]">{c.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center gap-2">
                            <ShoppingBagIcon className="w-4 h-4 text-[#0A2D6C]/50" />
                            <h2 className="text-base font-bold text-[#031E49]">Recent Orders</h2>
                        </div>
                        {recentOrders.length === 0 ? (
                            <p className="p-5 text-sm text-[#0A2D6C]/50">No orders found.</p>
                        ) : (
                            <div className="divide-y divide-[#031E49]/8">
                                {recentOrders.map(o => (
                                    <div key={o.order_code} className="px-5 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-mono font-bold text-[#031E49]">{o.order_code}</p>
                                            <p className="text-[11px] text-[#0A2D6C]/50">{o.product_sku} × {o.quantity}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[o.status] || "bg-gray-100"}`}>
                                            {o.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Invoices */}
                    <div className="bg-white rounded-2xl border border-[#031E49]/10 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#031E49]/10">
                            <h2 className="text-base font-bold text-[#031E49]">Invoices</h2>
                        </div>
                        {recentInvoices.length === 0 ? (
                            <p className="p-5 text-sm text-[#0A2D6C]/50">No invoices found.</p>
                        ) : (
                            <div className="divide-y divide-[#031E49]/8">
                                {recentInvoices.map(inv => (
                                    <div key={inv.invoice_number} className="px-5 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-mono font-bold text-[#031E49]">{inv.invoice_number}</p>
                                            <p className="text-[11px] text-[#0A2D6C]/50">{new Date(inv.created_at).toLocaleDateString("en-GB")}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-[#031E49]">{formatBDT(inv.total_bdt)}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[inv.status] || "bg-gray-100"}`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
