import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { getNotifications } from "@/lib/ops/data";

function levelTone(level: string): string {
  if (level === "WARN") return "bg-amber-100 text-amber-700";
  if (level === "ERROR") return "bg-red-100 text-red-700";
  return "bg-[#031E49]/10 text-[#031E49]";
}

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications("ADMIN", 40);

  return (
    <OpsShell
      title="Notifications Center"
      subtitle="Unified alerts for SLA breaches, dispatch delays, and low-stock conditions."
      activeHref="/admin/notifications"
      scopeLabel="Admin ERP"
      roleLabel="Alert Desk"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/notifications", label: "Notifications", tone: "neutral" },
        { href: "/admin/orders", label: "Orders", tone: "neutral" },
        { href: "/admin/inventory", label: "Inventory", tone: "primary" },
      ]}
    >
      <section className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#031E49]">Admin Alerts</h2>
        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-[#0A2D6C]/60">No active notifications.</p>
          ) : (
            notifications.map((item) => (
              <article key={item.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#031E49]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#0A2D6C]/65">{item.body}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${levelTone(item.level)}`}>
                    {item.level}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-[#0A2D6C]/50">
                  {item.source || "system"} · {new Date(item.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </OpsShell>
  );
}
