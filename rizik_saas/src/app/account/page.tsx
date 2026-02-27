"use client";

import { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { UserCircleIcon, BellIcon, ShieldCheckIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function AccountPage() {
    const [saved, setSaved] = useState(false);

    function handleSave() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[#031E49] mb-8">Account Settings</h1>

                {/* Profile Section */}
                <div className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <UserCircleIcon className="w-5 h-5 text-[#00B16A]" />
                        <h2 className="text-lg font-bold text-[#031E49]">Profile Information</h2>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#031E49] flex items-center justify-center text-[#F5F2EB] text-2xl font-bold">
                            S
                        </div>
                        <div>
                            <p className="font-bold text-[#031E49]">Sabbir Ahmed</p>
                            <p className="text-sm text-[#0A2D6C]/50">sabbir@rizik.io • SUPER_ADMIN</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-1.5">Full Name</label>
                            <input
                                type="text"
                                defaultValue="Sabbir Ahmed"
                                className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#031E49] mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                defaultValue="+880 1XXX-XXXXXX"
                                className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-[#031E49] mb-1.5">Email</label>
                            <input
                                type="email"
                                defaultValue="sabbir@rizik.io"
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/30 text-sm text-[#031E49]/50 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className={`mt-6 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${saved ? "bg-[#00B16A] text-white" : "bg-[#031E49] text-white hover:bg-[#0A2D6C]"}`}
                    >
                        {saved ? "✓ Saved!" : "Save Changes"}
                    </button>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BellIcon className="w-5 h-5 text-[#00B16A]" />
                        <h2 className="text-lg font-bold text-[#031E49]">Notification Preferences</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Order Confirmations", desc: "Email when a new order is placed", default: true },
                            { label: "Shipment Updates", desc: "Email when order status changes", default: true },
                            { label: "Low Stock Alerts", desc: "Notify when inventory drops below threshold", default: false },
                            { label: "Weekly Analytics Report", desc: "Revenue and order summary every Monday", default: true },
                        ].map((n, i) => (
                            <label key={i} className="flex items-center justify-between p-4 rounded-xl border border-[#031E49]/10 cursor-pointer hover:bg-[#F5F2EB]/50 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-[#031E49]">{n.label}</p>
                                    <p className="text-xs text-[#0A2D6C]/40">{n.desc}</p>
                                </div>
                                <input type="checkbox" defaultChecked={n.default} className="w-5 h-5 accent-[#031E49] rounded" />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheckIcon className="w-5 h-5 text-[#00B16A]" />
                        <h2 className="text-lg font-bold text-[#031E49]">Security</h2>
                    </div>

                    <button className="w-full text-left p-4 rounded-xl border border-[#031E49]/10 hover:bg-[#F5F2EB]/50 transition-colors">
                        <p className="text-sm font-bold text-[#031E49]">Change Password</p>
                        <p className="text-xs text-[#0A2D6C]/40">Update your account password</p>
                    </button>
                </div>

                {/* Sign Out */}
                <form action={signOutAction}>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                        <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );
}
