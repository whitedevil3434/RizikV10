import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PayrollPage() {
    const admin = createAdminClient();
    const { data: payroll } = await admin.from("rizik_payroll").select("*").order("employee_id");
    const { data: employees } = await admin.from("rizik_employees").select("id, full_name, employee_code, department");

    const empMap = new Map((employees || []).map((e: { id: string; full_name: string; employee_code: string; department: string }) => [e.id, e]));
    const records = (payroll || []) as Array<{ id: string; employee_id: string; month: number; year: number; basic_bdt: number; allowances_bdt: number; deductions_bdt: number; net_salary_bdt: number; status: string }>;
    const totalNet = records.reduce((s, r) => s + r.net_salary_bdt, 0);

    const statusColor: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-700", PROCESSED: "bg-blue-100 text-blue-700", PAID: "bg-emerald-100 text-emerald-700" };
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <OpsShell title="Payroll" subtitle="Monthly payroll breakdown — basic, allowances, deductions, and net." activeHref="/admin/hr" scopeLabel="Admin ERP" roleLabel="HR Operations" navItems={adminNavItems}
            quickLinks={[{ href: "/admin/hr", label: "Dashboard", tone: "neutral" }, { href: "/admin/hr/employees", label: "Employees", tone: "neutral" }, { href: "/admin/hr/payroll", label: "Payroll", tone: "primary" }]}>

            <div className="rounded-xl border border-[#031E49]/10 bg-white p-4 shadow-sm mb-6">
                <p className="text-xs text-[#0A2D6C]/50 mb-1">TOTAL NET PAYROLL</p>
                <p className="text-2xl font-bold text-[#031E49]">৳{Math.round(totalNet).toLocaleString()}</p>
            </div>

            <section className="rounded-2xl border border-[#031E49]/10 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#031E49]/10"><h2 className="text-base font-bold text-[#031E49]">Payroll Records</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-[0.06em] text-[#031E49]/50 bg-[#F5F2EB] border-b border-[#031E49]/10">
                            <tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Period</th><th className="px-5 py-3">Basic</th><th className="px-5 py-3">Allowances</th><th className="px-5 py-3">Deductions</th><th className="px-5 py-3">Net Salary</th><th className="px-5 py-3">Status</th></tr>
                        </thead>
                        <tbody>{records.map(r => {
                            const emp = empMap.get(r.employee_id) as { full_name: string; employee_code: string; department: string } | undefined; return (
                                <tr key={r.id} className="border-b border-[#031E49]/8 hover:bg-[#F5F2EB]/40">
                                    <td className="px-5 py-3"><p className="font-semibold text-[#031E49]">{emp?.full_name || "Unknown"}</p><p className="text-[11px] text-[#0A2D6C]/45">{emp?.department || ""}</p></td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">{months[r.month]} {r.year}</td>
                                    <td className="px-5 py-3 text-[#0A2D6C]/70">৳{Math.round(r.basic_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3 text-[#00B16A]">+৳{Math.round(r.allowances_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3 text-red-600">-৳{Math.round(r.deductions_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3 font-bold text-[#031E49]">৳{Math.round(r.net_salary_bdt).toLocaleString()}</td>
                                    <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColor[r.status] || "bg-gray-100"}`}>{r.status}</span></td>
                                </tr>);
                        })}</tbody>
                    </table>
                </div>
            </section>
        </OpsShell>
    );
}
