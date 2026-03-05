import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/client";
import { BanknotesIcon, DocumentTextIcon, CalendarDaysIcon, UserIcon } from "@heroicons/react/24/outline";

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("rizik_invoices")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-4">
                <div className="text-center rounded-2xl border border-[#031E49]/10 bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#031E49] mb-2">Invoice Not Found</h1>
                    <Link href="/admin/finance/invoices" className="text-[#00B16A] font-bold hover:text-emerald-700">Back to Invoices</Link>
                </div>
            </div>
        );
    }

    const inv = data as {
        id: string; invoice_number: string; order_code: string | null;
        customer_name: string; customer_email: string | null;
        items_json: unknown; subtotal_bdt: number; tax_bdt: number; total_bdt: number;
        status: string; due_date: string | null; paid_at: string | null;
        payment_method: string | null; notes: string | null; created_at: string;
    };

    const statusColor: Record<string, string> = {
        DRAFT: "bg-gray-200 text-gray-800",
        SENT: "bg-blue-200 text-blue-800",
        PAID: "bg-emerald-200 text-emerald-800",
        OVERDUE: "bg-red-200 text-red-800",
    };

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm flex items-center gap-2">
                    <Link href="/admin/finance" className="text-[#00B16A] font-semibold hover:text-emerald-700">Finance</Link>
                    <span className="text-[#031E49]/30">/</span>
                    <Link href="/admin/finance/invoices" className="text-[#00B16A] font-semibold hover:text-emerald-700">Invoices</Link>
                    <span className="text-[#031E49]/30">/</span>
                    <span className="text-[#031E49]/50">{inv.invoice_number}</span>
                </nav>

                {/* Invoice Card */}
                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#031E49] text-white px-8 py-6 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.14em] text-white/60 mb-1">INVOICE</p>
                            <h1 className="text-2xl font-bold font-mono">{inv.invoice_number}</h1>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${statusColor[inv.status]}`}>
                            {inv.status}
                        </span>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-8 space-y-8">
                        {/* Customer + Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-1">
                                    <UserIcon className="w-4 h-4" /> BILLED TO
                                </div>
                                <p className="font-bold text-[#031E49]">{inv.customer_name}</p>
                                <p className="text-sm text-[#0A2D6C]/60">{inv.customer_email || "No email"}</p>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-1">
                                        <CalendarDaysIcon className="w-4 h-4" /> ISSUED
                                    </div>
                                    <p className="text-sm font-semibold text-[#031E49]">{new Date(inv.created_at).toLocaleDateString("en-GB")}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-1">
                                        <CalendarDaysIcon className="w-4 h-4" /> DUE DATE
                                    </div>
                                    <p className="text-sm font-semibold text-[#031E49]">{inv.due_date || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {inv.order_code && (
                            <div className="rounded-xl bg-[#F5F2EB] p-4 text-sm">
                                <span className="text-[#0A2D6C]/50">Linked Order: </span>
                                <span className="font-mono font-bold text-[#031E49]">{inv.order_code}</span>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="rounded-2xl border border-[#031E49]/10 overflow-hidden">
                            <div className="grid grid-cols-3 text-center divide-x divide-[#031E49]/10">
                                <div className="p-4">
                                    <p className="text-[11px] uppercase text-[#0A2D6C]/50 mb-1">Subtotal</p>
                                    <p className="text-lg font-bold text-[#031E49]">৳{Math.round(inv.subtotal_bdt).toLocaleString()}</p>
                                </div>
                                <div className="p-4">
                                    <p className="text-[11px] uppercase text-[#0A2D6C]/50 mb-1">Tax (7.5%)</p>
                                    <p className="text-lg font-bold text-[#031E49]">৳{Math.round(inv.tax_bdt).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-[#031E49]/5">
                                    <p className="text-[11px] uppercase text-[#0A2D6C]/50 mb-1">Total</p>
                                    <p className="text-2xl font-bold text-[#031E49]">৳{Math.round(inv.total_bdt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        {inv.status === "PAID" && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
                                <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-800">Payment Received</p>
                                    <p className="text-xs text-emerald-600">
                                        via {inv.payment_method || "Unknown"} on {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString("en-GB") : "—"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {inv.status === "OVERDUE" && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                                <DocumentTextIcon className="w-5 h-5 text-red-600" />
                                <div>
                                    <p className="text-sm font-bold text-red-800">Payment Overdue</p>
                                    <p className="text-xs text-red-600">This invoice has passed its due date. Follow up with the customer.</p>
                                </div>
                            </div>
                        )}

                        {inv.notes && (
                            <div className="rounded-xl bg-[#F5F2EB] p-4">
                                <p className="text-xs text-[#0A2D6C]/50 mb-1">Notes</p>
                                <p className="text-sm text-[#031E49]">{inv.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
