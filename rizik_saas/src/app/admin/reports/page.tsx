import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { getDailyReports } from "@/lib/ops/data";
import {
    CalendarIcon,
    UserCircleIcon,
    BriefcaseIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default async function AdminReportsPage() {
    const reports = await getDailyReports();

    return (
        <OpsShell
            title="Staff Performance Reports"
            subtitle="Detailed daily logs from operations, sales, and field agents."
            activeHref="/admin/reports"
            scopeLabel="Admin ERP"
            roleLabel="Performance Review"
            navItems={adminNavItems}
            quickLinks={[
                { href: "/admin/analytics", label: "Analytics", tone: "neutral" },
                { href: "/admin/reports", label: "Staff Reports", tone: "primary" },
            ]}
        >
            <div className="space-y-6">
                {reports.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-[#031E49]/10 shadow-sm">
                        <CalendarIcon className="w-12 h-12 text-[#0A2D6C]/20 mx-auto mb-4" />
                        <p className="text-[#031E49] font-bold">No reports submitted yet.</p>
                        <p className="text-sm text-[#0A2D6C]/60">Check back later once staff starts logging their day.</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-3xl border border-[#031E49]/10 p-8 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#031E49]/5 flex items-center justify-center text-[#031E49]">
                                        <UserCircleIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#031E49]">{report.employee_name}</h3>
                                        <p className="text-xs text-[#0A2D6C]/60 flex items-center gap-1">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            {new Date(report.report_date).toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="px-4 py-2 rounded-2xl bg-[#00B16A]/10 text-[#00B16A] text-center">
                                        <p className="text-[10px] font-bold uppercase">Sales</p>
                                        <p className="text-lg font-black">{report.sales_count}</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-2xl bg-[#0A2D6C]/10 text-[#0A2D6C] text-center">
                                        <p className="text-[10px] font-bold uppercase">Orders</p>
                                        <p className="text-lg font-black">{report.orders_handled}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-[#0A2D6C]/40 uppercase flex items-center gap-2">
                                        <BriefcaseIcon className="w-4 h-4" />
                                        Summary of Work
                                    </p>
                                    <p className="text-sm text-[#031E49] bg-[#F5F2EB]/40 p-5 rounded-2xl leading-relaxed">
                                        {report.summary}
                                    </p>
                                </div>
                                {report.issues_encountered && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-red-400 uppercase flex items-center gap-2">
                                            <ExclamationCircleIcon className="w-4 h-4" />
                                            Issues / Blockers
                                        </p>
                                        <p className="text-sm text-red-900 bg-red-50 p-5 rounded-2xl border border-red-100 leading-relaxed">
                                            {report.issues_encountered}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </OpsShell>
    );
}
