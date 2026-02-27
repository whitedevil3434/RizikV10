# Rizik Ecosystem SaaS: Enterprise Architecture Plan

## Vision
To evolve `rizik_saas` from a simple B2B portal into a comprehensive, Almighty E-commerce & Enterprise Resource Planning (ERP) platform. This will be the central nervous system of Rizik Global, rivaling the structural complexity of Alibaba or Meta's internal tools, but with God-tier Gen-Z aesthetics.

## 1. Role-Based Access Control (RBAC) & Hierarchy
A strict, scalable hierarchy to manage the entire company's workflow.

*   **1. The God Tier (Admin / Owner):** Complete system override. Can view all global revenue, inventory, and control all user tiers. (e.g., Sabbir, Nusrat).
*   **2. The Management Tier (Employees / Hub Managers):**
    *   **Logistics Managers:** Track shipping, handle dispatch.
    *   **Production Managers:** Oversee Retort batches and Eco-Mat weaving. Generate QR codes.
    *   **Customer Support (CRM):** Chat with users, accept/cancel orders, handle disputes.
*   **3. The Client Tier (Customers / B2B Orgs):**
    *   **B2C Consumers:** Can browse products, add to cart, checkout, and track their personal deliveries.
    *   **B2B Wholesale Buyers:** Need special pricing tiers, bulk ordering tools, and invoice generation.

## 2. Core Modules (The 4 Pillars of the SaaS)

### Pillar A: The E-Commerce Storefront (User Facing)
*   **Landing Page (`/`):** High-converting, heavily animated showcase of products (Eco-Mats, Bio-Shield packets).
*   **Product Details (`/product/[id]`):** Deep dive into science, specs, and a direct "Add to Cart" flow.
*   **Customer Dashboard (`/account`):** Where regular users track orders, view past invoices, and manage their profile.

### Pillar B: The Order & Logistics Engine (Employee Facing)
*   **Order Pipeline (`/admin/orders`):** A Kanban-style board (Pending -> Accepted -> Processing -> Shipped -> Delivered).
*   **CRM / Communications (`/admin/chat`):** Integrated messaging system to chat with customers regarding their specific order IDs (like AliExpress/Daraz chat).

### Pillar C: Production & Inventory Control (ERP base)
*   **Resource Tracking (`/admin/inventory`):** Live database of raw materials (Chitosan, non-woven fabric rolls) vs. Finished goods.
*   **QR Code Generator (`/admin/qr`):**
    *   *Function:* When a batch of Mats or Bio-Shield is created, the Production Manager generates a unique QR code.
    *   *Linkage:* This QR code is affixed to the physical product. Scanning it links directly back to the SaaS app (e.g., `rizik.io/verify/[batch_id]`), proving authenticity and showing production date/specs.

### Pillar D: Analytics & Finance
*   **Financial Dashboard (`/admin/finance`):** Revenue charts, Cost of Goods Sold (COGS), and profit margin analytics.

## 3. Technology Integration Plan
To build this rapidly while maintaining extreme quality:
*   **Frontend UI:** Next.js (App Router), Tailwind CSS, Framer Motion, Shadcn UI (for complex data tables, modal dialogs, and forms).
*   **Authentication:** Supabase Auth (Handles Roles natively via JWT claims).
*   **Database:** Supabase PostgreSQL. We will need to expand `create_empire_tables.sql` into a massive ERP schema.
*   **QR Codes:** `qrcode.react` package to generate SVGs dynamically in the browser, which can then be printed.

## Next Immediate Steps
1.  Expand the Supabase database schema to include Cart, E-commerce Orders, Employee Roles, and QR Auth tracking.
2.  Build the Auth flow to redirect Users to `/product` and Employees to `/admin/dashboard`.
3.  Set up the QR Code generation utility function.
