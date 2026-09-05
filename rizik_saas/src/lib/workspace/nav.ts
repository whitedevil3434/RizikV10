import type { AppRole } from "@/lib/auth/policy";

export type WorkspaceIconKey =
  | "home"
  | "orders"
  | "products"
  | "crm"
  | "notifications"
  | "production"
  | "inventory"
  | "qr"
  | "team"
  | "analytics"
  | "fair"
  | "squads"
  | "community"
  | "tasks"
  | "requests"
  | "knowledge"
  | "logistics"
  | "finance"
  | "hr"
  | "checkin"
  | "report"
  | "ziny";


export interface WorkspaceNavItem {
  href: string;
  label: string;
  icon: WorkspaceIconKey;
  description?: string;
  /** If set, only these roles can see this nav item. If empty/undefined, all roles see it. */
  visibleTo?: AppRole[];
}

/** Filter nav items based on user role */
export function getFilteredNavItems(role: AppRole, items: WorkspaceNavItem[]): WorkspaceNavItem[] {
  return items.filter((item) => {
    if (!item.visibleTo || item.visibleTo.length === 0) return true;
    return item.visibleTo.includes(role);
  });
}

export const adminNavItems: WorkspaceNavItem[] = [
  { href: "/admin", label: "Operations Hub", icon: "home", description: "Executive command view" },
  { href: "/admin/notifications", label: "Notifications", icon: "notifications", description: "Unified ops alerts" },
  { href: "/admin/orders", label: "Orders", icon: "orders", description: "B2B and B2C order flow" },
  { href: "/admin/products", label: "Products", icon: "products", description: "Catalog and pricing" },
  { href: "/admin/crm", label: "Support", icon: "crm", description: "Ticket operations" },
  { href: "/admin/community", label: "Community Mod", icon: "community", description: "Post moderation queue" },
  { href: "/admin/production", label: "Production", icon: "production", description: "Batch and line control" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory", description: "Stock and warehouse" },
  { href: "/admin/qr", label: "QR Tags", icon: "qr", description: "Traceable tag generation" },
  { href: "/admin/fair", label: "Fair Ops", icon: "fair", description: "Launch campaign and leaderboard" },
  { href: "/admin/squads", label: "Squad Ops", icon: "squads", description: "Temporary workforce control" },
  { href: "/admin/squads/openclaw", label: "OpenClaw AI", icon: "squads", description: "Printer Command" },
  { href: "/admin/team", label: "Team & RBAC", icon: "team", description: "Access and workforce" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics", description: "Revenue and KPI insights" },
  { href: "/admin/finance", label: "Finance", icon: "finance", description: "Invoicing and expenses" },
  { href: "/admin/hr", label: "HR & People", icon: "hr", description: "Workforce and payroll" },
  { href: "/admin/ziny", label: "Ziny", icon: "ziny", description: "Personal AI · Cortex Memory" },
];

export const portalNavItems: WorkspaceNavItem[] = [
  // Visible to ALL portal roles
  { href: "/portal", label: "হোম / Home", icon: "home", description: "Your dashboard" },
  { href: "/portal/notifications", label: "🔔 নোটিফিকেশন", icon: "notifications", description: "Alerts & updates" },
  { href: "/portal/checkin", label: "🕒 হাজিরা", icon: "checkin", description: "Check in / out" },
  { href: "/portal/tasks", label: "📋 আমার কাজ", icon: "tasks", description: "Task board" },
  { href: "/portal/report", label: "⚠️ সমস্যা রিপোর্ট", icon: "report", description: "Report an issue" },

  // Visible to specific roles only
  {
    href: "/portal/requests", label: "Requests", icon: "requests", description: "Approvals & submissions",
    visibleTo: ["SUPER_ADMIN", "PRODUCTION_MANAGER", "LOGISTICS_MANAGER", "SUPPORT_AGENT", "B2B_BUYER", "GENERAL_STAFF"]
  },
  {
    href: "/portal/logistics", label: "Logistics", icon: "logistics", description: "Shipment visibility",
    visibleTo: ["SUPER_ADMIN", "LOGISTICS_MANAGER", "DELIVERY_AGENT", "SUPPORT_AGENT"]
  },
  {
    href: "/fair/dashboard", label: "Fair Tracker", icon: "fair", description: "Fair tasks",
    visibleTo: ["SUPER_ADMIN", "PRODUCTION_MANAGER", "LOGISTICS_MANAGER", "SUPPORT_AGENT", "B2B_BUYER"]
  },
  {
    href: "/community", label: "Community", icon: "community", description: "Social feed",
    visibleTo: ["SUPER_ADMIN", "PRODUCTION_MANAGER", "LOGISTICS_MANAGER", "SUPPORT_AGENT", "B2B_BUYER", "GENERAL_STAFF"]
  },
  { href: "/portal/knowledge", label: "📖 জ্ঞান / SOP", icon: "knowledge", description: "Training docs" },
];
