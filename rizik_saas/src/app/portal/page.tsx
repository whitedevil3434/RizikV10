import Link from "next/link";
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  TruckIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import OpsShell from "@/components/workspace/ops-shell";
import { portalNavItems, getFilteredNavItems } from "@/lib/workspace/nav";
import { getPortalDashboardData } from "@/lib/ops/data";
import { getCurrentUserContext } from "@/lib/auth/session";
import { isSimplifiedRole } from "@/lib/auth/policy";

// === QUICK ACTION CONFIGS PER ROLE ===
const SIMPLIFIED_ACTIONS: Record<string, Array<{ href: string; emoji: string; bangla: string; english: string; gradient: string }>> = {
  FACTORY_WORKER: [
    { href: "/portal/checkin", emoji: "🕒", bangla: "হাজিরা দিন", english: "Check In", gradient: "from-[#00B16A] to-[#059669]" },
    { href: "/portal/tasks", emoji: "📦", bangla: "আজকের কাজ", english: "My Tasks", gradient: "from-[#031E49] to-[#0A2D6C]" },
    { href: "/portal/report", emoji: "⚠️", bangla: "সমস্যা রিপোর্ট", english: "Report Issue", gradient: "from-red-500 to-red-600" },
    { href: "/portal/knowledge", emoji: "📖", bangla: "SOP / ট্রেনিং", english: "Training", gradient: "from-[#6366F1] to-[#4F46E5]" },
  ],
  DELIVERY_AGENT: [
    { href: "/portal/checkin", emoji: "🕒", bangla: "হাজিরা দিন", english: "Check In", gradient: "from-[#00B16A] to-[#059669]" },
    { href: "/portal/logistics", emoji: "🚚", bangla: "আমার ডেলিভারি", english: "My Deliveries", gradient: "from-[#031E49] to-[#0A2D6C]" },
    { href: "/portal/tasks", emoji: "📋", bangla: "আজকের কাজ", english: "My Tasks", gradient: "from-[#F59E0B] to-[#D97706]" },
    { href: "/portal/report", emoji: "⚠️", bangla: "সমস্যা রিপোর্ট", english: "Report Issue", gradient: "from-red-500 to-red-600" },
  ],
  GENERAL_STAFF: [
    { href: "/portal/checkin", emoji: "🕒", bangla: "হাজিরা দিন", english: "Check In", gradient: "from-[#00B16A] to-[#059669]" },
    { href: "/portal/tasks", emoji: "📋", bangla: "আমার কাজ", english: "My Tasks", gradient: "from-[#031E49] to-[#0A2D6C]" },
    { href: "/portal/report", emoji: "⚠️", bangla: "সমস্যা রিপোর্ট", english: "Report Issue", gradient: "from-red-500 to-red-600" },
    { href: "/portal/notifications", emoji: "🔔", bangla: "নোটিফিকেশন", english: "Alerts", gradient: "from-[#F59E0B] to-[#D97706]" },
  ],
};

// === FULL DASHBOARD MODULES (for managers/admins) ===
const fullModules = [
  { href: "/portal/notifications", label: "Notifications", desc: "Unified operational alerts", icon: BellAlertIcon },
  { href: "/portal/tasks", label: "Task Board", desc: "Track daily assignments", icon: ClipboardDocumentCheckIcon },
  { href: "/portal/requests", label: "Request Center", desc: "Submit and track approvals", icon: ClockIcon },
  { href: "/portal/logistics", label: "Logistics View", desc: "See shipment pipeline", icon: TruckIcon },
  { href: "/portal/knowledge", label: "Knowledge Base", desc: "SOP and policy docs", icon: BookOpenIcon },
  { href: "/portal/checkin", label: "🕒 হাজিরা / Check-In", desc: "Daily attendance", icon: ClockIcon },
  { href: "/portal/report", label: "⚠️ Report Issue", desc: "Submit problem reports", icon: ExclamationTriangleIcon },
  { href: "/fair/dashboard", label: "Fair Dashboard", desc: "Monitor fair tasks and race", icon: BoltIcon },
  { href: "/community", label: "Community Feed", desc: "Public feedback and engagement", icon: ChatBubbleLeftRightIcon },
];

export default async function PortalPage() {
  const { role } = await getCurrentUserContext();
  const isSimple = isSimplifiedRole(role);
  const navItems = getFilteredNavItems(role, portalNavItems);

  // === SIMPLIFIED VIEW (Factory Workers, Delivery Agents, General Staff) ===
  if (isSimple) {
    const actions = SIMPLIFIED_ACTIONS[role] || SIMPLIFIED_ACTIONS.GENERAL_STAFF;

    return (
      <OpsShell
        title="আপনার কাজ"
        subtitle="আপনার দৈনিক কাজের জন্য নিচের বাটন চাপুন"
        activeHref="/portal"
        scopeLabel="কর্মী পোর্টাল"
        roleLabel="Quick Actions"
        navItems={navItems}
        quickLinks={[
          { href: "/portal/checkin", label: "হাজিরা", tone: "neutral" },
          { href: "/portal/tasks", label: "কাজ", tone: "neutral" },
          { href: "/portal/report", label: "রিপোর্ট", tone: "primary" },
        ]}
      >
        {/* Giant date display */}
        <div className="text-center mb-8">
          <p className="text-sm text-[#0A2D6C]/60">
            {new Date().toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Dhaka" })}
          </p>
        </div>

        {/* BIG ACTION BUTTONS — 2 columns, each tile fills the space */}
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`rounded-3xl bg-gradient-to-br ${action.gradient} text-white p-8 shadow-xl hover:shadow-2xl active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center min-h-[160px]`}
            >
              <span className="text-5xl block mb-3">{action.emoji}</span>
              <span className="text-lg font-bold block">{action.bangla}</span>
              <span className="text-xs opacity-70 block mt-1">{action.english}</span>
            </Link>
          ))}
        </div>

        {/* Simple help text */}
        <p className="text-center text-xs text-[#0A2D6C]/40 mt-8">
          কোনো সমস্যা হলে ⚠️ সমস্যা রিপোর্ট বাটন চাপুন
        </p>
      </OpsShell>
    );
  }

  // === FULL DASHBOARD (Managers, Admins, Support Agents, B2B Buyers) ===
  const dashboard = await getPortalDashboardData();

  // Check if searchParams has report=success
  const kpis = [
    { label: "Assigned Tasks", value: String(dashboard.assigned_tasks), hint: `${dashboard.high_priority_tasks} near deadline` },
    { label: "Open Requests", value: String(dashboard.open_requests), hint: "Workflow queue" },
    { label: "Active Shipments", value: String(dashboard.active_shipments), hint: "Logistics stream" },
    { label: "Team Availability", value: `${dashboard.team_availability_pct}%`, hint: "Computed from task pressure" },
  ];

  return (
    <OpsShell
      title="Employee Operations Portal"
      subtitle="Single workspace for daily task execution, cross-team coordination, and operations visibility."
      activeHref="/portal"
      scopeLabel="Employee Portal"
      roleLabel="Team Workspace"
      navItems={navItems}
      quickLinks={[
        { href: "/portal/notifications", label: "Alerts", tone: "neutral" },
        { href: "/portal/tasks", label: "Tasks", tone: "neutral" },
        { href: "/portal/checkin", label: "🕒 Check-In", tone: "primary" },
      ]}
    >
      {/* Daily Report Banner */}
      {!dashboard.has_daily_report && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-sm font-bold text-amber-900">আজকের রিপোর্ট জমা দেওয়া হয়নি</p>
              <p className="text-xs text-amber-700">Daily reporting helps us track your progress.</p>
            </div>
          </div>
          <Link href="/portal/report/daily" className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all">
            ফিলাপ করুন
          </Link>
        </div>
      )}

      {dashboard.has_daily_report && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-bold text-emerald-900">আজকের রিপোর্ট জমা হয়েছে</p>
            <p className="text-xs text-emerald-700">Thank you for keeping us updated!</p>
          </div>
        </div>
      )}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {kpis.map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-[#031E49]/45 font-semibold">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#031E49]">{item.value}</p>
            <p className="mt-2 text-xs text-[#0A2D6C]/55">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-7">
        <article className="xl:col-span-2 rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#031E49] mb-4">Operations Feed</h2>
          <div className="space-y-3">
            {dashboard.feed.length === 0 ? (
              <p className="text-sm text-[#0A2D6C]/60">No live feed records available.</p>
            ) : (
              dashboard.feed.map((feed) => (
                <div key={`${feed.time}-${feed.title}`} className="rounded-xl border border-[#031E49]/8 bg-[#F5F2EB]/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#031E49]">{feed.title}</p>
                    <span className="text-[11px] font-semibold text-[#031E49]/50">{feed.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#0A2D6C]/60">{feed.detail}</p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-[#031E49]/10 bg-gradient-to-br from-[#031E49] to-[#0A2D6C] text-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-white/60 font-semibold">Daily Mission</p>
          <h3 className="mt-3 text-xl font-bold">Fast Coordination, Zero Confusion</h3>
          <p className="mt-3 text-sm text-white/75 leading-relaxed">
            Team execution is now linked to shared alerts, requests, and logistics surfaces using live database records.
          </p>
          <Link href="/portal/tasks" className="mt-6 inline-flex px-4 py-2 rounded-full bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]">
            Open My Tasks
          </Link>
        </article>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#031E49] mb-4">All Employee Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {fullModules.map((module) => (
            <Link key={module.href} href={module.href} className="group rounded-2xl border border-[#031E49]/10 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="h-10 w-10 rounded-xl bg-[#031E49]/10 text-[#031E49] flex items-center justify-center">
                <module.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#031E49] group-hover:text-[#00B16A]">{module.label}</h3>
              <p className="mt-2 text-sm text-[#0A2D6C]/60">{module.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </OpsShell>
  );
}
