import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BanknotesIcon, DocumentTextIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default async function FinanceDashboardPage() {
    const admin = createAdminClient();

    // Fetch invoices
    const { data: invoices } = await admin
        .from("rizik_invoices")
        .select("id, invoice_number, total_bdt, status, paid_at")
        .order("created_at", { ascending: false });

    // Fetch expenses
    const { data: expenses } = await admin
        .from("rizik_expenses")
        .select("id, amount_bdt, status, category")
        .order("created_at", { ascending: false });

    const inv = (invoices || []) as Array<{ id: string; invoice_number: string; total_bdt: number; status: string; paid_at: string | null }>;
    const exp = (expenses || []) as Array<{ id: string; amount_bdt: number; status: string; category: string }>;

    // KPIs
    const totalRevenue = inv.filter(i => i.status === "PAID").reduce((s, i) => s + i.total_bdt, 0);
    const totalOutstanding = inv.filter(i => i.status === "SENT" || i.status === "OVERDUE").reduce((s, i) => s + i.total_bdt, 0);
    const totalOverdue = inv.filter(i => i.status === "OVERDUE").reduce((s, i) => s + i.total_bdt, 0);
    const totalExpenses = exp.filter(e => e.status === "APPROVED" || e.status === "PROCESSED").reduce((s, e) => s + e.amount_bdt, 0);
    const pendingExpenses = exp.filter(e => e.status === "PENDING").length;

    function formatBDT(n: number) {
        if (n >= 1000000) return `৳${(n / 1000000).toFixed(2)}M`;
        if (n >= 1000) return `৳${(n / 1000).toFixed(1)}K`;
        return `৳${Math.round(n).toLocaleString()}`;
    }

    const statusColor: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-700",
        SENT: "bg-blue-100 text-blue-700",
        PAID: "bg-emerald-100 text-emerald-700",
        OVERDUE: "bg-red-100 text-red-700",
    };

    return (
        <OpsShell
            title="Financial Control"
            subtitle="Revenue tracking, invoicing, and expense management."
            activeHref="/admin/finance"
            scopeLabel="Admin ERP"
            roleLabel="Finance Operations"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/finance/invoices", label: "Invoices", tone: "neutral" },
                { href: "/admin/finance/expenses", label: "Expenses", tone: "neutral" },
                { href: "/admin/analytics", label: "Analytics", tone: "primary" },
            ]}
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2">
                        <ArrowTrendingUpIcon className="w-4 h-4" /> REVENUE (COLLECTED)
                    </div>
                    <p className="text-2xl font-bold text-[#031E49]">{formatBDT(totalRevenue)}</p>
                    <p className="text-xs text-[#00B16A] mt-1">↗ {inv.filter(i => i.status === "PAID").length} paid invoices</p>
                </div>
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2">
                        <DocumentTextIcon className="w-4 h-4" /> OUTSTANDING (AR)
                    </div>
                    <p className="text-2xl font-bold text-[#031E49]">{formatBDT(totalOutstanding)}</p>
                    <p className="text-xs text-amber-600 mt-1">↗ {inv.filter(i => i.status === "SENT").length} sent, awaiting payment</p>
                </div>
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" /> OVERDUE
                    </div>
                    <p className="text-2xl font-bold text-red-600">{formatBDT(totalOverdue)}</p>
                    <p className="text-xs text-red-500 mt-1">⚠ {inv.filter(i => i.status === "OVERDUE").length} overdue invoices</p>
                </div>
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2">
                        <BanknotesIcon className="w-4 h-4" /> EXPENSES (APPROVED)
                    </div>
                    <p className="text-2xl font-bold text-[#031E49]">{formatBDT(totalExpenses)}</p>
                    <p className="text-xs text-[#0A2D6C]/50 mt-1">{pendingExpenses} pending approval</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
                        <h2 className="text-base font-bold text-[#031E49]">Recent Invoices</h2>
                        <Link href="/admin/finance/invoices" className="text-xs font-semibold text-[#00B16A] hover:text-emerald-700">View All →</Link>
                    </div>
                    <div className="divide-y divide-[#031E49]/8">
                        {inv.slice(0, 5).map((invoice) => (
                            <Link key={invoice.id} href={`/admin/finance/invoices/${invoice.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F5F2EB]/40 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-[#031E49] font-mono">{invoice.invoice_number}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-[#031E49]">{formatBDT(invoice.total_bdt)}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[invoice.status] || "bg-gray-100 text-gray-700"}`}>
                                        {invoice.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recent Expenses */}
                <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
                        <h2 className="text-base font-bold text-[#031E49]">Recent Expenses</h2>
                        <Link href="/admin/finance/expenses" className="text-xs font-semibold text-[#00B16A] hover:text-emerald-700">View All →</Link>
                    </div>
                    <div className="divide-y divide-[#031E49]/8">
                        {exp.slice(0, 5).map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between px-5 py-3.5">
                                <div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#031E49]/10 text-[#031E49]/70 mr-2">{expense.category}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-[#031E49]">{formatBDT(expense.amount_bdt)}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${expense.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                            expense.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                                                "bg-blue-100 text-blue-700"
                                        }`}>{expense.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </OpsShell>
    );
}
