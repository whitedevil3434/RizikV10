import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";

export default async function LeavePage() {
    const admin = createAdminClient();
    const { data: leaves } = await admin.from("rizik_leave_requests").select("*").order("created_at", { ascending: false });
    const { data: employees } = await admin.from("rizik_employees").select("id, full_name, employee_code");

    const empMap = new Map((employees || []).map((e: { id: string; full_name: string; employee_code: string }) => [e.id, e]));
    const records = (leaves || []) as Array<{ id: string; employee_id: string; leave_type: string; start_date: string; end_date: string; days: number; reason: string | null; status: string; approved_by: string | null; created_at: string }>;

    const typeColor: Record<string, string> = { ANNUAL: "bg-blue-100 text-blue-700", SICK: "bg-red-100 text-red-700", CASUAL: "bg-purple-100 text-purple-700", MATERNITY: "bg-pink-100 text-pink-700" };
    const statusColor: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", APPROVED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700" };

    return (
        <OpsShell title="Leave Management" subtitle="Employee leave requests — approve, reject, and track balances." activeHref="/admin/hr" scopeLabel="Admin ERP" roleLabel="HR Operations" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/hr", label: "Dashboard", tone: "neutral" }, { href: "/admin/hr/leave", label: "Leave", tone: "primary" }, { href: "/admin/hr/payroll", label: "Payroll", tone: "neutral" }]}>
            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">Leave Requests</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">From</th><th className="px-5 py-3">To</th><th className="px-5 py-3">Days</th><th className="px-5 py-3">Reason</th><th className="px-5 py-3">Status</th></tr>
                        </thead>
                        <tbody>{records.map(r => {
                            const emp = empMap.get(r.employee_id) as { full_name: string } | undefined; return (
                                <tr key={r.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">{emp?.full_name || "Unknown"}</td>
                                    <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColor[r.leave_type] || "bg-gray-100"}`}>{r.leave_type}</span></td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">{r.start_date}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">{r.end_date}</td>
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">{r.days}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/60 max-w-[200px] truncate">{r.reason || "—"}</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[r.status] || "bg-gray-100"}`}>{r.status}</span></td>
                                </tr>);
                        })}</tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
