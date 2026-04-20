import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { UsersIcon, CalendarDaysIcon, BanknotesIcon, ClockIcon } from "@heroicons/react/24/outline";

export default async function HRDashboardPage() {
    const admin = createAdminClient();

    const { data: employees } = await admin.from("rizik_employees").select("id, full_name, department, designation, salary_bdt, status");
    const { data: leaves } = await admin.from("rizik_leave_requests").select("id, status, days").order("created_at", { ascending: false });
    const { data: payroll } = await admin.from("rizik_payroll").select("id, net_salary_bdt, status").eq("month", 2).eq("year", 2026);

    const emps = (employees || []) as Array<{ id: string; full_name: string; department: string; designation: string; salary_bdt: number; status: string }>;
    const leaveList = (leaves || []) as Array<{ id: string; status: string; days: number }>;
    const payrollList = (payroll || []) as Array<{ id: string; net_salary_bdt: number; status: string }>;

    const activeCount = emps.filter(e => e.status === "ACTIVE").length;
    const pendingLeaves = leaveList.filter(l => l.status === "PENDING").length;
    const totalPayroll = payrollList.reduce((s, p) => s + p.net_salary_bdt, 0);
    const departments = [...new Set(emps.map(e => e.department))];

    function formatBDT(n: number) {
        if (n >= 1000000) return `৳${(n / 1000000).toFixed(2)}M`;
        return `৳${Math.round(n).toLocaleString()}`;
    }

    const statusColor: Record<string, string> = {
        ACTIVE: "bg-emerald-100 text-emerald-700",
        ON_LEAVE: "bg-amber-100 text-amber-700",
        TERMINATED: "bg-red-100 text-red-700",
    };

    return (
        <OpsShell
            title="HR & People"
            subtitle="Workforce management — employees, attendance, leave, and payroll."
            activeHref="/admin/hr"
            scopeLabel="Admin ERP"
            roleLabel="HR Operations"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/hr/employees", label: "Employees", tone: "neutral" },
                { href: "/admin/hr/attendance", label: "Attendance", tone: "neutral" },
                { href: "/admin/hr/leave", label: "Leave", tone: "neutral" },
                { href: "/admin/hr/payroll", label: "Payroll", tone: "primary" },
            ]}
        >
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2"><UsersIcon className="w-4 h-4" /> HEADCOUNT</div>
                    <p className="text-2xl font-bold text-[#031E49]">{emps.length}</p>
                    <p className="text-xs text-[#00B16A] mt-1">{activeCount} active</p>
                </div>
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2"><CalendarDaysIcon className="w-4 h-4" /> DEPARTMENTS</div>
                    <p className="text-2xl font-bold text-[#031E49]">{departments.length}</p>
                    <p className="text-xs text-[#0A2D6C]/50 mt-1">{departments.slice(0, 3).join(", ")}</p>
                </div>
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2"><ClockIcon className="w-4 h-4" /> PENDING LEAVES</div>
                    <p className="text-2xl font-bold text-amber-600">{pendingLeaves}</p>
                    <p className="text-xs text-amber-500 mt-1">{leaveList.filter(l => l.status === "APPROVED").length} approved this period</p>
                </div>
                <div className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-[#0A2D6C]/50 mb-2"><BanknotesIcon className="w-4 h-4" /> PAYROLL (FEB)</div>
                    <p className="text-2xl font-bold text-[#031E49]">{formatBDT(totalPayroll)}</p>
                    <p className="text-xs text-[#0A2D6C]/50 mt-1">{payrollList.length} employees</p>
                </div>
            </div>

            {/* Employee Quick View */}
            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10 flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#031E49]">Team Overview</h2>
                    <Link href="/admin/hr/employees" className="text-xs font-semibold text-[#00B16A] hover:text-emerald-700">View All →</Link>
                </div>
                <div className="divide-y divide-[#031E49]/8">
                    {emps.map(emp => (
                        <div key={emp.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#F5F2EB]/40 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#031E49]/10 flex items-center justify-center text-xs font-bold text-[#031E49]">
                                    {emp.full_name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#031E49]">{emp.full_name}</p>
                                    <p className="text-[11px] text-[#0A2D6C]/50">{emp.designation} · {emp.department}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[emp.status] || "bg-gray-100"}`}>
                                {emp.status.replace("_", " ")}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </OpsShell>
    );
}
