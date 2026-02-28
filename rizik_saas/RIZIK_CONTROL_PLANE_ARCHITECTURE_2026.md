# Rizik Control Plane Architecture (2026)

## Objective
Operate Rizik at enterprise standard with strict surface separation:
- Public brand surface (trust, demand, storytelling)
- Customer commerce surface (store, checkout, account)
- Control plane surface (B2B operations + admin ERP)

## Surface Boundaries
- Public and Customer:
  - `/`, `/b2b`, `/subsidiaries`, `/impact`, `/trust`, `/store`, `/cart`, `/checkout`, `/account`
- Control Plane:
  - `/portal` (B2B operations)
  - `/admin` (internal ERP)

## Guardrails Implemented
- Server-side role gates:
  - `src/app/portal/layout.tsx`
  - `src/app/admin/layout.tsx`
- Early edge gate:
  - `src/middleware.ts`
  - Unauthenticated control-plane access -> `/login?next=...`
- Optional hostname split:
  - `OPS_HOSTNAME` env var
  - If set, `/admin` and `/portal` are redirected to ops host
- Bootstrap endpoint protection:
  - `POST /api/setup-db` requires setup key (`SETUP_DB_KEY`)
  - `GET /api/setup-db` is disabled (`405`)

## Role Model
- Source of truth:
  - `src/lib/auth/policy.ts`
  - `src/lib/auth/role-policy-map.ts`
- Core roles:
  - `GUEST`, `CUSTOMER`, `B2B_BUYER`, `SUPPORT_AGENT`, `PRODUCTION_MANAGER`, `LOGISTICS_MANAGER`, `SUPER_ADMIN`

## CTO Release Rules
- Rule 1: No control-plane UI elements on public surfaces for guest/customer users.
- Rule 2: All control-plane routes must fail closed (redirect if no valid auth/role).
- Rule 3: Public B2B demand capture stays public (`/b2b`), operations stay restricted (`/portal`).
- Rule 4: Service-role key only in server runtime.
- Rule 5: Deploy blocked if security checklist is incomplete.

## Phase-2 Upgrades
- Add per-route permission checks using `hasRolePermission`.
- Add audit logs for privileged actions (user updates, catalog changes, order status changes).
- Add SSO + passkey for control-plane users.
- Split control plane to dedicated `ops.` deployment target.
