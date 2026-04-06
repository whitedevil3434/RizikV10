export const ADMIN_ROLES = ["SUPER_ADMIN", "PRODUCTION_MANAGER", "LOGISTICS_MANAGER"] as const;
export const SIMPLIFIED_ROLES = ["FACTORY_WORKER", "DELIVERY_AGENT", "GENERAL_STAFF"] as const;
export const PORTAL_ROLES = ["B2B_BUYER", "SUPPORT_AGENT", ...ADMIN_ROLES, ...SIMPLIFIED_ROLES] as const;

export type AppRole = (typeof PORTAL_ROLES)[number] | "CUSTOMER" | "GUEST";

export const CONTROL_PLANE_PREFIXES = ["/admin", "/portal"] as const;
export const AUTH_SURFACE_PREFIXES = ["/login", "/auth"] as const;

export function canAccessAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function canAccessPortalRole(role: string): boolean {
  return PORTAL_ROLES.includes(role as (typeof PORTAL_ROLES)[number]);
}

/** Returns true if the role is a simplified/low-tech employee role */
export function isSimplifiedRole(role: string): boolean {
  return SIMPLIFIED_ROLES.includes(role as (typeof SIMPLIFIED_ROLES)[number]);
}

export function isControlPlanePath(pathname: string): boolean {
  return CONTROL_PLANE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthSurfacePath(pathname: string): boolean {
  return AUTH_SURFACE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Maps a user role to an operational team for task filtering */
export function getRoleTeam(role: string): string | undefined {
  const mapping: Record<string, string> = {
    SUPER_ADMIN: "Operations",
    PRODUCTION_MANAGER: "Production",
    LOGISTICS_MANAGER: "Logistics",
    SUPPORT_AGENT: "Support",
    DELIVERY_AGENT: "Logistics",
    FACTORY_WORKER: "Production",
    GENERAL_STAFF: "Operations",
    B2B_BUYER: "Sales",
  };
  return mapping[role];
}
