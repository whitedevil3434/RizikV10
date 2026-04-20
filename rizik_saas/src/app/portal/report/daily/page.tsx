import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems } from "@/lib/workspace/nav";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/session";

export default async function DailyReportPage() {
    const { user, role } = await getCurrentUserContext();

    if (!user) redirect("/login");

    // Fetch employee record to get employee_id
    const admin = createAdminClient();
    const { data: employee } = await admin
        .from("rizik_employees")
        .select("id")
        .eq("user_id", user.id)
        .single();

    async function submitReport(formData: FormData) {
        "use server";
        const employeeId = formData.get("employeeId") as string;
        const summary = formData.get("summary") as string;
        const salesCount = parseInt(formData.get("salesCount") as string) || 0;
        const ordersHandled = parseInt(formData.get("ordersHandled") as string) || 0;
        const issues = formData.get("issues") as string;

        const supabase = createAdminClient();
        const { error } = await supabase.from("rizik_daily_reports").insert({
            employee_id: employeeId,
            summary,
            sales_count: salesCount,
            orders_handled: ordersHandled,
            issues_encountered: issues,
        });

        if (!error) {
            redirect("/portal?report=success");
        }
    }

    return (
        <OpsShell
            title="দৈনিক কাজের রিপোর্ট"
            subtitle="আজকের দিনের কাজের সারমর্ম এখানে জমা দিন"
            activeHref="/portal/report"
            scopeLabel="কর্মী পোর্টাল"
            roleLabel="Daily Reporting"
            navItems={portalNavItems}
        >
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#031E49]/10 p-8 shadow-xl">
                <form action={submitReport} className="space-y-6">
                    <input type="hidden" name="employeeId" value={employee?.id || ""} />

                    <div>
                        <label className="block text-sm font-bold text-[#031E49] mb-2">আজকের কাজের সারমর্ম (Summary) *</label>
                        <textarea
                            name="summary"
                            required
                            rows={4}
                            placeholder="আজকে আপনি কি কি গুরুত্বপূর্ণ কাজ করেছেন?"
                            className="w-full rounded-2xl border border-[#031E49]/10 p-4 text-sm focus:ring-2 focus:ring-[#00B16A] outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-2">কতগুলো সেল করেছেন? (Sales)</label>
                            <input
                                type="number"
                                name="salesCount"
                                defaultValue="0"
                                className="w-full rounded-2xl border border-[#031E49]/10 p-4 text-sm focus:ring-2 focus:ring-[#00B16A] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-2">কতগুলো অর্ডার হ্যান্ডেল করেছেন?</label>
                            <input
                                type="number"
                                name="ordersHandled"
                                defaultValue="0"
                                className="w-full rounded-2xl border border-[#031E49]/10 p-4 text-sm focus:ring-2 focus:ring-[#00B16A] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#031E49] mb-2">কোনো সমস্যা বা বাধা (Issues)?</label>
                        <textarea
                            name="issues"
                            rows={3}
                            placeholder="যদি কোনো সমস্যা ফেস করে থাকেন তবে এখানে লিখুন"
                            className="w-full rounded-2xl border border-[#031E49]/10 p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-gradient-to-r from-[#00B16A] to-[#059669] text-white p-4 font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                    >
                        রিপোর্ট জমা দিন (Submit Report)
                    </button>
                </form>
            </div>
        </OpsShell>
    );
}
