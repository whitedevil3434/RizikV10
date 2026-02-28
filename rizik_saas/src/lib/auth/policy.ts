export const ADMIN_ROLES = ["SUPER_ADMIN", "PRODUCTION_MANAGER", "LOGISTICS_MANAGER"] as const;
export const PORTAL_ROLES = ["B2B_BUYER", "SUPPORT_AGENT", ...ADMIN_ROLES] as const;

export type AppRole = (typeof PORTAL_ROLES)[number] | "CUSTOMER" | "GUEST";

export const CONTROL_PLANE_PREFIXES = ["/admin", "/portal"] as const;
export const AUTH_SURFACE_PREFIXES = ["/login", "/auth"] as const;

export function canAccessAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function canAccessPortalRole(role: string): boolean {
  return PORTAL_ROLES.includes(role as (typeof PORTAL_ROLES)[number]);
}

export function isControlPlanePath(pathname: string): boolean {
  return CONTROL_PLANE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthSurfacePath(pathname: string): boolean {
  return AUTH_SURFACE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
