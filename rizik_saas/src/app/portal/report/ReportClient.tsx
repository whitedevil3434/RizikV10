"use client";

import { useState, useTransition } from "react";
import OpsShell from "@/components/workspace/ops-shell";
import { reportIssueAction } from "@/lib/actions/employee";
import type { WorkspaceNavItem } from "@/lib/workspace/nav";

const categories = [
    { value: "MACHINE_ISSUE", label: "🔧 মেশিন সমস্যা / Machine Problem" },
    { value: "SAFETY_HAZARD", label: "⚠️ নিরাপত্তা সমস্যা / Safety Issue" },
    { value: "MATERIAL_SHORTAGE", label: "📦 মালামাল শেষ / Material Shortage" },
    { value: "OTHER", label: "📝 অন্যান্য / Other" },
];

export default function ReportPageClient({ navItems }: { navItems: WorkspaceNavItem[] }) {
    const [isPending, startTransition] = useTransition();
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [reportCode, setReportCode] = useState("");

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await reportIssueAction(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setSubmitted(true);
                setReportCode(result.code || "");
            }
        });
    };

    return (
        <OpsShell
            title="⚠️ সমস্যা রিপোর্ট"
            subtitle="কোনো সমস্যা হলে এখানে জানান"
            activeHref="/portal/report"
            scopeLabel="Employee Portal"
            roleLabel="Issue Report"
            navItems={navItems}
            quickLinks={[
                { href: "/portal", label: "হোম", tone: "neutral" },
                { href: "/portal/checkin", label: "হাজিরা", tone: "neutral" },
                { href: "/portal/report", label: "রিপোর্ট", tone: "primary" },
            ]}
        >
            <div className="max-w-lg mx-auto">
                {submitted ? (
                    <div className="text-center py-12">
                        <span className="text-7xl block mb-4">✅</span>
                        <h2 className="text-2xl font-bold text-[#031E49]">রিপোর্ট পাঠানো হয়েছে!</h2>
                        <p className="text-sm text-[#0A2D6C]/60 mt-2">Report submitted successfully</p>
                        <div className="mt-4 rounded-2xl bg-[#F5F2EB] p-4 inline-block">
                            <p className="text-xs text-[#0A2D6C]/50 uppercase">Report Code</p>
                            <p className="text-lg font-mono font-bold text-[#031E49]">{reportCode}</p>
                        </div>
                        <button
                            onClick={() => { setSubmitted(false); setError(""); }}
                            className="mt-8 block mx-auto px-6 py-3 rounded-full bg-[#031E49] text-white font-bold hover:bg-[#0A2D6C] active:scale-[0.98] transition-all"
                        >
                            আরেকটি রিপোর্ট করুন
                        </button>
                    </div>
                ) : (
                    <form action={handleSubmit} className="space-y-6">
                        {/* Category selector — BIG touch targets */}
                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-3">সমস্যার ধরন বাছাই করুন</label>
                            <div className="space-y-3">
                                {categories.map((cat) => (
                                    <label key={cat.value} className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#031E49]/10 bg-white cursor-pointer hover:border-[#00B16A] has-[:checked]:border-[#00B16A] has-[:checked]:bg-[#00B16A]/5 transition-all">
                                        <input type="radio" name="category" value={cat.value} required className="w-5 h-5 text-[#00B16A] accent-[#00B16A]" />
                                        <span className="text-base font-semibold text-[#031E49]">{cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Note field */}
                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-2">কী হয়েছে লিখুন (Write what happened)</label>
                            <textarea
                                name="note"
                                required
                                rows={4}
                                placeholder="এখানে লিখুন..."
                                className="w-full rounded-2xl border-2 border-[#031E49]/10 bg-white p-4 text-base text-[#031E49] placeholder:text-[#0A2D6C]/30 focus:border-[#00B16A] focus:outline-none transition-colors"
                            />
                        </div>

                        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

                        {/* Submit Button — BIG */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-16 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isPending ? "পাঠানো হচ্ছে..." : "📤 রিপোর্ট পাঠান / Submit Report"}
                        </button>
                    </form>
                )}
            </div>
        </OpsShell>
    );
}
