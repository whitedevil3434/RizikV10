import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";

export default async function AttendancePage() {
    const admin = createAdminClient();
    const { data: attendance } = await admin.from("rizik_attendance").select("id, employee_id, date, check_in, check_out, hours_worked, status").order("date", { ascending: false });
    const { data: employees } = await admin.from("rizik_employees").select("id, full_name, employee_code");

    const empMap = new Map((employees || []).map((e: { id: string; full_name: string; employee_code: string }) => [e.id, e]));
    const records = (attendance || []) as Array<{ id: string; employee_id: string; date: string; check_in: string; check_out: string; hours_worked: number; status: string }>;

    const statusColor: Record<string, string> = { PRESENT: "bg-emerald-100 text-emerald-700", ABSENT: "bg-red-100 text-red-700", LATE: "bg-amber-100 text-amber-700", HALF_DAY: "bg-blue-100 text-blue-700" };

    return (
        <OpsShell title="Attendance Log" subtitle="Daily check-in/check-out records for all employees." activeHref="/admin/hr" scopeLabel="Admin ERP" roleLabel="HR Operations" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/hr", label: "Dashboard", tone: "neutral" }, { href: "/admin/hr/attendance", label: "Attendance", tone: "primary" }, { href: "/admin/hr/leave", label: "Leave", tone: "neutral" }]}>
            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">Attendance Records</h2><p className="text-xs text-[#0A2D6C]/55">{records.length} entries</p></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Check-in</th><th className="px-5 py-3">Check-out</th><th className="px-5 py-3">Hours</th><th className="px-5 py-3">Status</th></tr>
                        </thead>
                        <tbody>{records.map(r => {
                            const emp = empMap.get(r.employee_id) as { full_name: string; employee_code: string } | undefined; return (
                                <tr key={r.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3"><p className="font-semibold text-[#031E49]">{emp?.full_name || "Unknown"}</p><p className="text-[11px] text-[#0A2D6C]/45 font-mono">{emp?.employee_code || ""}</p></td>
                                    <td className="px-5 py-3 text-[#031E49]">{r.date}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">{r.check_in || "—"}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">{r.check_out || "—"}</td>
                                    <td className="px-5 py-3 font-semibold text-[#031E49]">{r.hours_worked || "—"}h</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[r.status] || "bg-gray-100"}`}>{r.status}</span></td>
                                </tr>);
                        })}</tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
