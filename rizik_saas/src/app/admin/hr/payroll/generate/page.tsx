"use client";

import { useState, useTransition } from "react";
import { generatePayrollAction } from "@/lib/actions/hr";
import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { CheckCircleIcon, PlayIcon } from "@heroicons/react/24/outline";

export default function GeneratePayrollPage() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success?: boolean; error?: string; count?: number } | null>(null);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);

    async function handleGenerate() {
        setResult(null);
        startTransition(async () => {
            const res = await generatePayrollAction(month, year);
            setResult(res);
        });
    }

    return (
        <OpsShell
            title="Payroll Engine"
            subtitle="Automated monthly salary generation based on employee contracts."
            activeHref="/admin/hr"
            scopeLabel="Admin ERP"
            roleLabel="HR Intelligence"
            navItems={adminNavItems}
        >
            <div className="max-w-xl mx-auto py-10">
                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-xl overflow-hidden">
                    <div className="p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-[#031E49] mb-6">Generate Monthly Run</h2>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/40 uppercase tracking-widest px-1">Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] font-bold outline-none focus:ring-2 focus:ring-[#031E49]/20"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/40 uppercase tracking-widest px-1">Year</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] font-bold outline-none focus:ring-2 focus:ring-[#031E49]/20"
                                >
                                    {[currentYear, currentYear - 1].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {result?.error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
                                {result.error}
                            </div>
                        )}

                        {result?.success && (
                            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                Successfully generated {result.count} payroll records.
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isPending}
                            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${isPending
                                    ? "bg-[#031E49]/50 text-white/50 cursor-wait"
                                    : "bg-[#031E49] text-white hover:bg-[#0A2D6C] active:scale-95"
                                }`}
                        >
                            <PlayIcon className="w-5 h-5" />
                            {isPending ? "Calculating..." : "Start Generation Run"}
                        </button>

                        <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-[#F5F2EB]/50 border border-[#031E49]/5 text-[11px] text-[#0A2D6C]/60 italic leading-relaxed">
                            <span>Note: This run uses the latest contract data. Records are generated in DRAFT mode for CFO approval.</span>
                        </div>
                    </div>
                </div>
            </div>
        </OpsShell>
    );
}
