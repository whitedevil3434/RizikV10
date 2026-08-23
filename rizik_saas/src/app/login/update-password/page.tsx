"use client";

import { useState } from "react";
import { updatePasswordAction } from "@/lib/actions/auth";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import RizikLogo from "@/components/brand/rizik-logo";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await updatePasswordAction(formData);

        if (result && 'error' in result && result.error) {
            setError(result.error);
            setLoading(false);
        } else if (result && 'success' in result && result.success) {
            router.push(result.redirectTo || "/");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB] px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <RizikLogo className="h-10 w-auto mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-[#031E49]">Set New Password</h1>
                    <p className="text-sm text-[#0A2D6C]/60 mt-2">
                        Choose a strong, unique password for your Rizik account.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-lg p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" action={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-1.5">New Password</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#031E49]/30" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 focus:outline-none focus:ring-2 focus:ring-[#031E49] text-sm text-[#031E49]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#031E49]/40 hover:text-[#031E49] transition-colors"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#031E49]/30" />
                                <input
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 focus:outline-none focus:ring-2 focus:ring-[#031E49] text-sm text-[#031E49]"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#031E49] hover:bg-[#0A2D6C] text-white py-3.5 rounded-xl font-bold shadow-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
