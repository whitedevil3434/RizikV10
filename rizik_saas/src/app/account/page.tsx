import { redirect } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import { updateAccountProfileAction } from "@/lib/actions/account";
import { createAdminClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UserCircleIcon, BellIcon, ShieldCheckIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

const errorMessages: Record<string, string> = {
    invalid_name: "Full name must be between 2 and 120 characters.",
    profile_update_failed: "Could not update profile right now.",
};

function initialsFromName(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "R";
}

export default async function AccountPage({
    searchParams,
}: {
    searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
    const params = (await searchParams) || {};
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/account");
    }

    let profile: { full_name: string | null; role: string | null; avatar_url: string | null } | null = null;
    try {
        const admin = createAdminClient();
        const { data } = await admin
            .from("user_profiles")
            .select("full_name, role, avatar_url")
            .eq("id", user.id)
            .maybeSingle();
        profile = (data as { full_name: string | null; role: string | null; avatar_url: string | null } | null) || null;
    } catch {
        const { data } = await supabase
            .from("user_profiles")
            .select("full_name, role, avatar_url")
            .eq("id", user.id)
            .maybeSingle();
        profile = (data as { full_name: string | null; role: string | null; avatar_url: string | null } | null) || null;
    }

    const resolvedName =
        (profile?.full_name as string | null) ||
        (user.user_metadata?.full_name as string | undefined) ||
        user.email?.split("@")[0] ||
        "Rizik Member";
    const resolvedRole = (profile?.role as string | null) || "CUSTOMER";
    const resolvedAvatar = (profile?.avatar_url as string | null) || (user.user_metadata?.avatar_url as string | undefined) || null;
    const resolvedInitials = initialsFromName(resolvedName);

    return (
        <div className="min-h-screen bg-[#F5F2EB] py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[#031E49] mb-8">Account Settings</h1>

                {params.saved ? (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        Profile updated successfully.
                    </div>
                ) : null}

                {params.error ? (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {errorMessages[params.error] || "Failed to update account profile."}
                    </div>
                ) : null}

                {/* Profile Section */}
                <div className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <UserCircleIcon className="w-5 h-5 text-[#00B16A]" />
                        <h2 className="text-lg font-bold text-[#031E49]">Profile Information</h2>
                    </div>

                    <div className="flex items-center gap-6 mb-6">
                        {resolvedAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resolvedAvatar} alt="Profile avatar" className="w-16 h-16 rounded-full object-cover border border-[#031E49]/15" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-[#031E49] flex items-center justify-center text-[#F5F2EB] text-2xl font-bold">
                                {resolvedInitials}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-[#031E49]">{resolvedName}</p>
                            <p className="text-sm text-[#0A2D6C]/50">{user.email} • {resolvedRole}</p>
                        </div>
                    </div>

                    <form action={updateAccountProfileAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-[#031E49] mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                required
                                minLength={2}
                                maxLength={120}
                                defaultValue={resolvedName}
                                className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/50 text-sm text-[#031E49] focus:outline-none focus:ring-2 focus:ring-[#031E49]"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-[#031E49] mb-1.5">Email</label>
                            <input
                                type="email"
                                value={user.email || ""}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-[#031E49]/20 bg-[#F5F2EB]/30 text-sm text-[#031E49]/50 cursor-not-allowed"
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-2 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all bg-[#031E49] text-white hover:bg-[#0A2D6C]"
                        >
                            Save Changes
                        </button>
                    </form>
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
                        <p className="text-xs text-[#0A2D6C]/40">Use account recovery in login screen for secure reset</p>
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
