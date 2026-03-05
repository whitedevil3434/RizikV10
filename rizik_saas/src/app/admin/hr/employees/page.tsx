import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/client";

export default async function EmployeeDirectoryPage() {
    const admin = createAdminClient();
    const { data } = await admin.from("rizik_employees").select("*").order("employee_code");

    const employees = (data || []) as Array<{
        id: string; employee_code: string; full_name: string; email: string | null;
        phone: string | null; department: string; designation: string;
        join_date: string; salary_bdt: number; status: string;
    }>;

    const statusColor: Record<string, string> = {
        ACTIVE: "bg-emerald-100 text-emerald-700",
        ON_LEAVE: "bg-amber-100 text-amber-700",
        TERMINATED: "bg-red-100 text-red-700",
    };

    return (
        <OpsShell title="Employee Directory" subtitle="All employees with department, role, and status." activeHref="/admin/hr" scopeLabel="Admin ERP" roleLabel="HR Operations" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/hr", label: "Dashboard", tone: "neutral" }, { href: "/admin/hr/employees", label: "Employees", tone: "primary" }, { href: "/admin/hr/payroll", label: "Payroll", tone: "neutral" }]}>
            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">All Employees</h2></div>
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr>
                                <th className="px-5 py-3">Code</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Department</th>
                                <th className="px-5 py-3">Designation</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Salary</th><th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>{employees.map(e => (
                            <tr key={e.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                <td className="px-5 py-3 font-mono text-xs text-[#0A2D6C]/55">{e.employee_code}</td>
                                <td className="px-5 py-3"><p className="font-semibold text-[#031E49]">{e.full_name}</p><p className="text-[11px] text-[#0A2D6C]/45">{e.email}</p></td>
                                <td className="px-5 py-3 text-[#0A2D6C]/70">{e.department}</td>
                                <td className="px-5 py-3 text-[#0A2D6C]/70">{e.designation}</td>
                                <td className="px-5 py-3 text-xs text-[#0A2D6C]/60">{new Date(e.join_date).toLocaleDateString("en-GB")}</td>
                                <td className="px-5 py-3 font-semibold text-[#031E49]">৳{Math.round(e.salary_bdt).toLocaleString()}</td>
                                <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[e.status] || "bg-gray-100"}`}>{e.status.replace("_", " ")}</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
                <div className="md:hidden p-4 space-y-3">{employees.map(e => (
                    <article key={e.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 p-4">
                        <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-[#031E49]">{e.full_name}</p><p className="text-[11px] text-[#0A2D6C]/60">{e.designation} · {e.department}</p></div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[e.status] || "bg-gray-100"}`}>{e.status.replace("_", " ")}</span></div>
                        <div className="mt-2 flex items-center justify-between text-xs"><span className="font-mono text-[#0A2D6C]/50">{e.employee_code}</span><span className="font-semibold text-[#031E49]">৳{Math.round(e.salary_bdt).toLocaleString()}</span></div>
                    </article>
                ))}</div>
            </section>
        </OpsShell>
    );
}
