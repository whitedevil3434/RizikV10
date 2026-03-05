"use client";

import { useState, useTransition } from "react";
import OpsShell from "@/components/workspace/ops-shell";
import { type WorkspaceNavItem } from "@/lib/workspace/nav";
import { checkInAction, checkOutAction } from "@/lib/actions/employee";

export default function CheckInPageClient({
    employeeName,
    todayRecord,
    navItems,
}: {

    employeeName: string;
    todayRecord: { check_in: string; check_out: string | null } | null;
    navItems: WorkspaceNavItem[];
}) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "checked_in" | "checked_out" | "error">(
        todayRecord?.check_out ? "checked_out" : todayRecord?.check_in ? "checked_in" : "idle"
    );
    const [message, setMessage] = useState("");
    const [checkInTime, setCheckInTime] = useState(todayRecord?.check_in || "");
    const [checkOutTime, setCheckOutTime] = useState(todayRecord?.check_out || "");

    const handleCheckIn = () => {
        startTransition(async () => {
            const result = await checkInAction();
            if (result.error) {
                setStatus("error");
                setMessage(result.error);
            } else {
                setStatus("checked_in");
                setCheckInTime(result.time || "");
                setMessage("✅ হাজিরা সফল হয়েছে!");
            }
        });
    };

    const handleCheckOut = () => {
        startTransition(async () => {
            const result = await checkOutAction();
            if (result.error) {
                setStatus("error");
                setMessage(result.error);
            } else {
                setStatus("checked_out");
                setCheckOutTime(result.time || "");
                setMessage(`✅ চেক-আউট সফল! ${result.hoursWorked} ঘণ্টা কাজ করেছেন`);
            }
        });
    };

    const isCheckedIn = status === "checked_in";
    const isCheckedOut = status === "checked_out";
    const isIdle = status === "idle";

    return (
        <OpsShell
            title="🕒 হাজিরা / Attendance"
            subtitle="আপনার দৈনিক হাজিরা এখানে দিন"
            activeHref="/portal/checkin"
            scopeLabel="Employee Portal"
            roleLabel="Attendance"
            navItems={navItems}
            quickLinks={[
                { href: "/portal", label: "হোম", tone: "neutral" },
                { href: "/portal/tasks", label: "কাজ", tone: "neutral" },
                { href: "/portal/checkin", label: "হাজিরা", tone: "primary" },
            ]}
        >
            <div className="max-w-lg mx-auto text-center">
                {/* Employee Name */}
                <div className="mb-8">
                    <p className="text-sm text-[#0A2D6C]/60 uppercase tracking-wider">Employee</p>
                    <h2 className="text-2xl font-bold text-[#031E49] mt-1">{employeeName}</h2>
                    <p className="text-sm text-[#0A2D6C]/50 mt-1">
                        {new Date().toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Dhaka" })}
                    </p>
                </div>

                {/* Status Display */}
                {checkInTime && (
                    <div className="rounded-2xl border border-[#031E49]/10 bg-white p-4 mb-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#0A2D6C]/50 uppercase">ভেতরে এসেছেন</p>
                                <p className="text-xl font-bold text-[#00B16A]">{checkInTime}</p>
                            </div>
                            {checkOutTime && (
                                <div className="text-right">
                                    <p className="text-xs text-[#0A2D6C]/50 uppercase">বেরিয়ে গেছেন</p>
                                    <p className="text-xl font-bold text-[#031E49]">{checkOutTime}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* THE BIG BUTTON */}
                {isIdle && (
                    <button
                        onClick={handleCheckIn}
                        disabled={isPending}
                        className="w-full h-48 rounded-3xl bg-gradient-to-br from-[#00B16A] to-[#059669] text-white shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <span className="text-6xl block mb-2">🕒</span>
                        <span className="text-2xl font-bold block">হাজিরা দিন</span>
                        <span className="text-sm opacity-80 block mt-1">CHECK IN</span>
                    </button>
                )}

                {isCheckedIn && (
                    <button
                        onClick={handleCheckOut}
                        disabled={isPending}
                        className="w-full h-48 rounded-3xl bg-gradient-to-br from-[#031E49] to-[#0A2D6C] text-white shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <span className="text-6xl block mb-2">👋</span>
                        <span className="text-2xl font-bold block">বের হন</span>
                        <span className="text-sm opacity-80 block mt-1">CHECK OUT</span>
                    </button>
                )}

                {isCheckedOut && (
                    <div className="w-full h-48 rounded-3xl bg-gradient-to-br from-[#031E49]/5 to-[#031E49]/10 border-2 border-dashed border-[#031E49]/20 flex flex-col items-center justify-center">
                        <span className="text-6xl block mb-2">✅</span>
                        <span className="text-xl font-bold text-[#031E49] block">আজকের কাজ শেষ!</span>
                        <span className="text-sm text-[#0A2D6C]/60 block mt-1">Today&apos;s shift complete</span>
                    </div>
                )}

                {/* Feedback Message */}
                {message && (
                    <p className={`mt-6 text-sm font-semibold ${status === "error" ? "text-red-600" : "text-[#00B16A]"}`}>
                        {message}
                    </p>
                )}

                {isPending && (
                    <p className="mt-6 text-sm text-[#0A2D6C]/60 animate-pulse">Processing...</p>
                )}
            </div>
        </OpsShell>
    );
}
