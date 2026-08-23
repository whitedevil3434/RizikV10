"use client";

import { useState, useTransition } from "react";
import { submitB2BInquiryAction } from "@/lib/actions/b2b";
import { CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function B2BInquiryPage() {
    const [isPending, startTransition] = useTransition();
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const result = await submitB2BInquiryAction(formData);
            if (result.error) {
                setError(result.error);
                return;
            }
            setSubmitted(true);
        });
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-3xl border border-[#031E49]/10 shadow-xl p-10 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-[#00B16A] mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-[#031E49] mb-4">Inquiry Received</h1>
                    <p className="text-[#0A2D6C]/60 mb-8 leading-relaxed">
                        Master, your enterprise request has been logged. Our B2B operations team will review the requirements and contact you shortly.
                    </p>
                    <Link
                        href="/b2b"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#031E49] text-white rounded-full font-bold hover:bg-[#0A2D6C] transition-all shadow-lg"
                    >
                        Back to B2B Overview
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 text-center">
                    <p className="inline-flex px-3 py-1 rounded-full bg-[#031E49]/5 border border-[#031E49]/10 text-xs font-bold uppercase tracking-widest text-[#031E49]/60 mb-4">
                        Enterprise Intake
                    </p>
                    <h1 className="text-4xl font-bold text-[#031E49] mb-4">B2B Commercial Inquiry</h1>
                    <p className="text-[#0A2D6C]/60 max-w-xl mx-auto">
                        Submit your organization requirements for bulk procurement, custom enterprise solutions, or specialized packaging.
                    </p>
                </div>

                <form action={handleSubmit} className="bg-white rounded-[2.5rem] border border-[#031E49]/10 shadow-sm overflow-hidden">
                    <div className="p-8 md:p-12 space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/50 uppercase tracking-wider px-1">Organization Name *</label>
                                <input
                                    name="org_name"
                                    required
                                    placeholder="e.g. Dhaka Community Trust"
                                    className="w-full px-5 py-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]/20 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/50 uppercase tracking-wider px-1">Contact Person *</label>
                                <input
                                    name="contact_name"
                                    required
                                    placeholder="Full Name"
                                    className="w-full px-5 py-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]/20 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/50 uppercase tracking-wider px-1">Work Email *</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="name@org.com"
                                    className="w-full px-5 py-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]/20 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/50 uppercase tracking-wider px-1">Phone Number</label>
                                <input
                                    name="phone"
                                    placeholder="+880"
                                    className="w-full px-5 py-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]/20 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/50 uppercase tracking-wider px-1">Interest Category</label>
                                <select
                                    name="category"
                                    className="w-full px-5 py-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]/20 transition-all font-medium appearance-none"
                                >
                                    <option value="TEXTILE_BULK">Textile Bulk</option>
                                    <option value="BIO_SHIELD">Bio-Shield Packaging</option>
                                    <option value="CUSTOM">Custom Development</option>
                                    <option value="OTHER">Other Enterprise Solutions</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#031E49]/50 uppercase tracking-wider px-1">Estimated Monthly Volume</label>
                                <input
                                    name="estimated_volume"
                                    type="number"
                                    placeholder="e.g. 5000"
                                    className="w-full px-5 py-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#031E49]/50 uppercase tracking-wider px-1">Technical Requirements & Notes</label>
                            <textarea
                                name="requirements"
                                rows={4}
                                placeholder="Describe your specific needs, certification requirements, or timeline..."
                                className="w-full px-5 py-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/30 text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]/20 transition-all font-medium resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${isPending
                                    ? "bg-[#031E49]/50 text-white/50 cursor-wait"
                                    : "bg-[#031E49] text-white hover:bg-[#0A2D6C] active:scale-[0.98]"
                                }`}
                        >
                            {isPending ? "Submitting..." : "Submit Inquiry"}
                            {!isPending && <ArrowRightIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
