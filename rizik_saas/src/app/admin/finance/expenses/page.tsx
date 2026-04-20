import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ExpensesPage() {
    const admin = createAdminClient();
    const { data } = await admin
        .from("rizik_expenses")
        .select("*")
        .order("created_at", { ascending: false });

    const expenses = (data || []) as Array<{
        id: string; category: string; description: string;
        amount_bdt: number; submitted_by: string | null;
        approved_by: string | null; status: string; created_at: string;
    }>;

    const categoryColor: Record<string, string> = {
        MATERIALS: "bg-indigo-100 text-indigo-700",
        LOGISTICS: "bg-cyan-100 text-cyan-700",
        SALARY: "bg-purple-100 text-purple-700",
        UTILITIES: "bg-amber-100 text-amber-700",
        MARKETING: "bg-pink-100 text-pink-700",
    };

    const statusColor: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700",
        APPROVED: "bg-emerald-100 text-emerald-700",
        PROCESSED: "bg-blue-100 text-blue-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    const totalApproved = expenses.filter(e => e.status === "APPROVED" || e.status === "PROCESSED").reduce((s, e) => s + e.amount_bdt, 0);
    const totalPending = expenses.filter(e => e.status === "PENDING").reduce((s, e) => s + e.amount_bdt, 0);

    return (
        <OpsShell
            title="Expense Management"
            subtitle="Track, approve, and manage operational expenses across all departments."
            activeHref="/admin/finance"
            scopeLabel="Admin ERP"
            roleLabel="Finance Operations"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/finance", label: "Dashboard", tone: "neutral" },
                { href: "/admin/finance/invoices", label: "Invoices", tone: "neutral" },
                { href: "/admin/finance/expenses", label: "Expenses", tone: "primary" },
            ]}
        >
            {/* Summary Strip */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm">
                    <p className="text-xs text-[#0A2D6C]/50 mb-1">APPROVED TOTAL</p>
                    <p className="text-xl font-bold text-[#031E49]">৳{Math.round(totalApproved).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                    <p className="text-xs text-amber-600 mb-1">PENDING APPROVAL</p>
                    <p className="text-xl font-bold text-amber-700">৳{Math.round(totalPending).toLocaleString()}</p>
                </div>
            </div>

            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#031E49]">Expense Records</h2>
                    <p className="text-xs text-[#0A2D6C]/55">{expenses.length} entries</p>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-3">
                    {expenses.map((exp) => (
                        <article key={exp.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${categoryColor[exp.category] || "bg-gray-100"}`}>
                                    {exp.category}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[exp.status] || "bg-gray-100"}`}>
                                    {exp.status}
                                </span>
                            </div>
                            <p className="text-sm text-[#031E49] mt-2">{exp.description}</p>
                            <div className="mt-2 flex items-center justify-between text-xs">
                                <p className="font-semibold text-[#031E49]">৳{Math.round(exp.amount_bdt).toLocaleString()}</p>
                                <p className="text-[#0A2D6C]/50">{exp.submitted_by || "—"}</p>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3">Description</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Submitted By</th>
                                <th className="px-5 py-3">Approved By</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((exp) => (
                                <tr key={exp.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${categoryColor[exp.category] || "bg-gray-100"}`}>
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-[#031E49] max-w-[300px] truncate">{exp.description}</td>
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">৳{Math.round(exp.amount_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">{exp.submitted_by || "—"}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">{exp.approved_by || "—"}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[exp.status] || "bg-gray-100"}`}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-[#0A2D6C]/50">{new Date(exp.created_at).toLocaleDateString("en-GB")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
