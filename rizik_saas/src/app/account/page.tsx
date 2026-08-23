import { redirect } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import { updateAccountProfileAction } from "@/lib/actions/account";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UserCircleIcon, BellIcon, ShieldCheckIcon, ArrowRightStartOnRectangleIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getRoleTeam } from "@/lib/auth/policy";

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

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    MANUFACTURING: "bg-indigo-100 text-indigo-700",
    QA_HOLD: "bg-orange-100 text-orange-700",
    SHIPPED: "bg-cyan-100 text-cyan-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
};

async function OrderHistorySection({ customerName }: { customerName: string }) {
    let orders: Array<{ order_code: string; product_sku: string | null; quantity: number; unit_price_bdt: number; status: string; created_at: string }> = [];
    try {
        const admin = createAdminClient();
        const { data } = await admin
            .from("rizik_order_records")
            .select("order_code, product_sku, quantity, unit_price_bdt, status, created_at")
            .eq("customer_name", customerName)
            .order("created_at", { ascending: false })
            .limit(20);
        orders = (data || []) as typeof orders;
    } catch { /* empty */ }

    return (
        <div className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
                <ClipboardDocumentListIcon className="w-5 h-5 text-[#00B16A]" />
                <h2 className="text-lg font-bold text-[#031E49]">Order History</h2>
            </div>

            {orders.length === 0 ? (
                <p className="text-sm text-[#0A2D6C]/50">No orders found. Your account activity will appear here once available.</p>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order.order_code} className="flex items-center justify-between p-4 rounded-xl border border-[#031E49]/10 hover:bg-[#F5F2EB]/50 transition-colors">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-[#031E49] font-mono">#{order.order_code}</p>
                                <p className="text-xs text-[#0A2D6C]/50 mt-0.5">
                                    {order.product_sku} × {order.quantity} &middot; {new Date(order.created_at).toLocaleDateString("en-GB")}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <p className="text-sm font-semibold text-[#031E49]">৳{(order.unit_price_bdt * order.quantity).toLocaleString()}</p>
                                <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const taskStatusColors: Record<string, string> = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700 font-bold",
    DONE: "bg-emerald-100 text-emerald-700",
};

async function EmployeeTasksSection({ team }: { team: string }) {
    let tasks: Array<{ title: string; status: string; due_at: string | null }> = [];
    try {
        const admin = createAdminClient();
        const { data } = await admin
            .from("rizik_employee_tasks")
            .select("title, status, due_at")
            .eq("owner_team", team)
            .neq("status", "DONE")
            .order("due_at", { ascending: true })
            .limit(5);
        tasks = (data || []) as typeof tasks;
    } catch { /* empty */ }

    if (tasks.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-[#031E49]/10 p-8 shadow-sm mb-6 bg-gradient-to-br from-white to-[#F5F2EB]/30">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-[#031E49]" />
                    <h2 className="text-lg font-bold text-[#031E49]">Your Team Tasks ({team})</h2>
                </div>
                <Link href="/portal/tasks" className="text-xs font-bold text-[#031E49] hover:underline">View All →</Link>
            </div>

            <div className="space-y-3">
                {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-[#031E49]/5 bg-white shadow-sm">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-[#031E49] truncate">{task.title}</p>
                            {task.due_at && (
                                <p className="text-[10px] text-[#0A2D6C]/40 mt-0.5">
                                    Due: {new Date(task.due_at).toLocaleString("en-GB", { day: "2-digit", month: "short" })}
                                </p>
                            )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${taskStatusColors[task.status] || "bg-gray-100 text-gray-700"}`}>
                            {task.status.replace("_", " ")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
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

                {/* Employee Tasks */}
                {getRoleTeam(resolvedRole) && (
                    <EmployeeTasksSection team={getRoleTeam(resolvedRole)!} />
                )}

                {/* Order History */}
                <OrderHistorySection customerName={resolvedName} />

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
