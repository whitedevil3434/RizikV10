export type WorkspaceIconKey =
  | "home"
  | "orders"
  | "products"
  | "crm"
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
  | "logistics";

export interface WorkspaceNavItem {
  href: string;
  label: string;
  icon: WorkspaceIconKey;
  description?: string;
}

export const adminNavItems: WorkspaceNavItem[] = [
  { href: "/admin", label: "Operations Hub", icon: "home", description: "Executive command view" },
  { href: "/admin/orders", label: "Orders", icon: "orders", description: "B2B and B2C order flow" },
  { href: "/admin/products", label: "Products", icon: "products", description: "Catalog and pricing" },
  { href: "/admin/crm", label: "Support", icon: "crm", description: "Ticket operations" },
  { href: "/admin/production", label: "Production", icon: "production", description: "Batch and line control" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory", description: "Stock and warehouse" },
  { href: "/admin/qr", label: "QR Tags", icon: "qr", description: "Traceable tag generation" },
  { href: "/admin/fair", label: "Fair Ops", icon: "fair", description: "Launch campaign and leaderboard" },
  { href: "/admin/squads", label: "Squad Ops", icon: "squads", description: "Temporary workforce control" },
  { href: "/admin/team", label: "Team & RBAC", icon: "team", description: "Access and workforce" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics", description: "Revenue and KPI insights" },
];

export const portalNavItems: WorkspaceNavItem[] = [
  { href: "/portal", label: "Overview", icon: "home", description: "Daily operations snapshot" },
  { href: "/portal/tasks", label: "My Tasks", icon: "tasks", description: "Assigned work queue" },
  { href: "/portal/requests", label: "Requests", icon: "requests", description: "Approvals and submissions" },
  { href: "/portal/logistics", label: "Logistics", icon: "logistics", description: "Shipment visibility" },
  { href: "/fair/dashboard", label: "Fair Tracker", icon: "fair", description: "Participant race and task monitoring" },
  { href: "/community", label: "Community", icon: "community", description: "Public feedback and social activity" },
  { href: "/portal/knowledge", label: "Knowledge", icon: "knowledge", description: "SOP and training docs" },
];
