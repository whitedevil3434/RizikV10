import type { AppRole } from "@/lib/auth/policy";

export type Permission =
  | "public:view"
  | "store:view"
  | "checkout:use"
  | "account:manage"
  | "b2b:inquiry"
  | "portal:view"
  | "admin:view"
  | "admin:manage_users"
  | "admin:manage_catalog"
  | "admin:manage_orders";

export const ROLE_POLICY_MAP: Record<AppRole, { label: string; permissions: Permission[] }> = {
  GUEST: {
    label: "Guest",
    permissions: ["public:view", "store:view", "b2b:inquiry"],
  },
  CUSTOMER: {
    label: "Customer",
    permissions: ["public:view", "store:view", "checkout:use", "account:manage", "b2b:inquiry"],
  },
  B2B_BUYER: {
    label: "B2B Buyer",
    permissions: ["public:view", "store:view", "checkout:use", "account:manage", "b2b:inquiry", "portal:view"],
  },
  SUPPORT_AGENT: {
    label: "Support Agent",
    permissions: ["public:view", "store:view", "account:manage", "portal:view", "admin:view", "admin:manage_orders"],
  },
  PRODUCTION_MANAGER: {
    label: "Production Manager",
    permissions: [
      "public:view",
      "store:view",
      "account:manage",
      "portal:view",
      "admin:view",
      "admin:manage_orders",
      "admin:manage_catalog",
    ],
  },
  LOGISTICS_MANAGER: {
    label: "Logistics Manager",
    permissions: [
      "public:view",
      "store:view",
      "account:manage",
      "portal:view",
      "admin:view",
      "admin:manage_orders",
    ],
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    permissions: [
      "public:view",
      "store:view",
      "checkout:use",
      "account:manage",
      "b2b:inquiry",
      "portal:view",
      "admin:view",
      "admin:manage_users",
      "admin:manage_catalog",
      "admin:manage_orders",
    ],
  },
};

export function hasRolePermission(role: AppRole, permission: Permission): boolean {
  return ROLE_POLICY_MAP[role].permissions.includes(permission);
}
