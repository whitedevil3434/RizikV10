"use client";

import { useState } from "react";
import { signInAction, signUpAction, syncFirebaseUserAndSignInAction, forgotPasswordAction } from "@/lib/actions/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase/config";
import { signInWithPopup } from "firebase/auth";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, UserIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import RizikLogo from "@/components/brand/rizik-logo";
import { useRouter, useSearchParams } from "next/navigation";

type PageMode = "signIn" | "signUp" | "forgotPassword";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<PageMode>("signIn");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loginFailed, setLoginFailed] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawNext = searchParams.get("next") || "";
    const nextPath = rawNext;

    async function handleSubmit(formData: FormData): Promise<void> {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const result = mode === "signUp"
            ? await signUpAction(formData)
            : await signInAction(formData);

        if (result && 'error' in result && result.error) {
            setError(result.error);
            if (mode === "signIn") setLoginFailed(true);
            setLoading(false);
        } else if (result && 'redirectTo' in result && result.redirectTo) {
            window.location.href = result.redirectTo;
        }
    }

    async function handleForgotPassword(formData: FormData): Promise<void> {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const result = await forgotPasswordAction(formData);
        if (result && 'error' in result && result.error) {
            setError(result.error);
        } else if (result && 'success' in result && result.success) {
            setSuccessMessage("If an account exists with this email, a password reset link has been sent. Check your inbox.");
        }
        setLoading(false);
    }

    async function handleFirebaseGoogleSignIn() {
        if (!isFirebaseConfigured || !auth || !googleProvider) {
            setError("Google Sign-In is not configured. Please use email and password.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const syncResult = await syncFirebaseUserAndSignInAction({
                uid: user.uid,
                email: user.email || "",
                name: user.displayName || "Google User",
                photoUrl: user.photoURL || ""
            }, nextPath);

            if (syncResult && 'error' in syncResult && syncResult.error) {
                setError(syncResult.error);
                setLoading(false);
            } else if (syncResult && 'redirectTo' in syncResult && syncResult.redirectTo) {
                window.location.href = syncResult.redirectTo;
            }
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Failed to authenticate with Google.";
            setError(message);
            setLoading(false);
        }
    }

    const title = mode === "signUp"
        ? "Create Your Rizik Account"
        : mode === "forgotPassword"
            ? "Reset Your Password"
            : "Sign in to Rizik Ecosystem";

    const subtitle = mode === "signUp"
        ? "Create an account to access store and business services."
        : mode === "forgotPassword"
            ? "Enter your email address and we'll send you a link to reset your password."
            : "Access your dashboard, storefront, or admin panel.";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB] px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <RizikLogo className="h-10 w-auto mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-[#031E49]">{title}</h1>
                    <p className="text-sm text-[#0A2D6C]/60 mt-2">{subtitle}</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl border border-[#031E49]/10 shadow-lg p-8">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* ===== FORGOT PASSWORD FORM ===== */}
                    {mode === "forgotPassword" ? (
                        <form className="space-y-5" action={handleForgotPassword}>
                            <div>
                                <label className="block text-sm font-bold text-[#031E49] mb-1.5">Email Address</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#031E49]/30" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@rizik.io"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 focus:outline-none focus:ring-2 focus:ring-[#031E49] text-sm text-[#031E49]"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#031E49] hover:bg-[#0A2D6C] text-white py-3.5 rounded-xl font-bold shadow-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setMode("signIn"); setError(null); setSuccessMessage(null); }}
                                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#0A2D6C]/60 hover:text-[#031E49] transition-colors mt-2"
                            >
                                <ArrowLeftIcon className="w-4 h-4" /> Back to Sign In
                            </button>
                        </form>
                    ) : (
                        <>
                            {/* ===== SIGN IN / SIGN UP FORM ===== */}
                            <form className="space-y-5" action={handleSubmit}>
                                <input type="hidden" name="next" value={nextPath} />

                                {/* Full Name (signup only) */}
                                {mode === "signUp" && (
                                    <div>
                                        <label className="block text-sm font-bold text-[#031E49] mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#031E49]/30" />
                                            <input
                                                name="fullName"
                                                type="text"
                                                required
                                                placeholder="Your full name"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 focus:outline-none focus:ring-2 focus:ring-[#031E49] text-sm text-[#031E49]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-[#031E49] mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#031E49]/30" />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="you@rizik.io"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 focus:outline-none focus:ring-2 focus:ring-[#031E49] text-sm text-[#031E49]"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-bold text-[#031E49]">Password</label>
                                        {mode === "signIn" && (
                                            <button
                                                type="button"
                                                onClick={() => { setMode("forgotPassword"); setError(null); setSuccessMessage(null); }}
                                                className={`text-xs font-semibold transition-colors ${loginFailed ? "text-red-500 hover:text-red-700 animate-pulse" : "text-[#00B16A] hover:text-emerald-700"}`}
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#031E49]/30" />
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={6}
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

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#031E49] hover:bg-[#0A2D6C] text-white py-3.5 rounded-xl font-bold shadow-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Processing..." : mode === "signUp" ? "Create Account" : "Sign In"}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="my-6 flex items-center gap-3">
                                <div className="flex-1 h-px bg-[#031E49]/10" />
                                <span className="text-xs text-[#0A2D6C]/40 font-medium">OR</span>
                                <div className="flex-1 h-px bg-[#031E49]/10" />
                            </div>

                            {/* Google OAuth (Firebase) */}
                            {isFirebaseConfigured ? (
                                <button
                                    type="button"
                                    onClick={handleFirebaseGoogleSignIn}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 border-2 border-[#031E49]/10 rounded-xl py-3 text-sm font-semibold text-[#031E49] hover:bg-[#F5F2EB]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>
                            ) : (
                                <p className="text-xs text-[#0A2D6C]/45 text-center">
                                    Google Sign-In is currently unavailable.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Toggle Sign Up / Sign In */}
                {mode !== "forgotPassword" && (
                    <p className="text-center text-sm text-[#0A2D6C]/50 mt-6">
                        {mode === "signUp" ? "Already have an account? " : "Don't have an account? "}
                        <button
                            onClick={() => { setMode(mode === "signUp" ? "signIn" : "signUp"); setError(null); setSuccessMessage(null); setLoginFailed(false); }}
                            className="text-[#00B16A] font-bold hover:text-emerald-700"
                        >
                            {mode === "signUp" ? "Sign In" : "Create Account"}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
