import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function InvoiceListPage() {
    const admin = createAdminClient();
    const { data } = await admin
        .from("rizik_invoices")
        .select("*")
        .order("created_at", { ascending: false });

    const invoices = (data || []) as Array<{
        id: string; invoice_number: string; order_code: string | null;
        customer_name: string; customer_email: string | null;
        subtotal_bdt: number; tax_bdt: number; total_bdt: number;
        status: string; due_date: string | null; paid_at: string | null;
        payment_method: string | null; created_at: string;
    }>;

    const statusColor: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-700",
        SENT: "bg-blue-100 text-blue-700",
        PAID: "bg-emerald-100 text-emerald-700",
        OVERDUE: "bg-red-100 text-red-700",
    };

    return (
        <OpsShell
            title="Invoices"
            subtitle="All invoices with payment status, amounts, and customer details."
            activeHref="/admin/finance"
            scopeLabel="Admin ERP"
            roleLabel="Finance Operations"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/finance", label: "Dashboard", tone: "neutral" },
                { href: "/admin/finance/expenses", label: "Expenses", tone: "neutral" },
                { href: "/admin/finance/invoices", label: "Invoices", tone: "primary" },
            ]}
        >
            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#031E49]">Invoice Ledger</h2>
                    <p className="text-xs text-[#0A2D6C]/55">{invoices.length} records</p>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-3">
                    {invoices.map((inv) => (
                        <Link key={inv.id} href={`/admin/finance/invoices/${inv.id}`} className="block rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4 hover:bg-[#F5F2EB]/70 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-bold text-[#031E49] font-mono">{inv.invoice_number}</p>
                                    <p className="text-xs text-[#0A2D6C]/60 mt-0.5">{inv.customer_name}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[inv.status] || "bg-gray-100"}`}>
                                    {inv.status}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <p className="text-[#031E49] font-semibold">৳{Math.round(inv.total_bdt).toLocaleString()}</p>
                                <p className="text-[#0A2D6C]/50">Due: {inv.due_date || "—"}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr>
                                <th className="px-5 py-3">Invoice</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Subtotal</th>
                                <th className="px-5 py-3">Tax</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3">
                                        <Link href={`/admin/finance/invoices/${inv.id}`} className="font-mono text-xs font-bold text-[#00B16A] hover:text-emerald-700">
                                            {inv.invoice_number}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="font-semibold text-[#031E49]">{inv.customer_name}</p>
                                        <p className="text-[11px] text-[#0A2D6C]/45">{inv.customer_email || "—"}</p>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{inv.order_code || "—"}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">৳{Math.round(inv.subtotal_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/50">৳{Math.round(inv.tax_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">৳{Math.round(inv.total_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[inv.status] || "bg-gray-100"}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-[#0A2D6C]/60">{inv.due_date || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
