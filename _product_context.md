# Product Context: RizikV10

## Current Phase: The Rizik Ecosystem (Enterprise SaaS)
- **Active Task:** Architecting the E-Commerce, ERP, and CRM modules for the Next.js `rizik_saas`.
- **Strategic Pivot:** Evolving beyond a simple B2B portal. The SaaS will now function as the central operating system for all Hub Managers, Employees, B2B Clients, and B2C Consumers. Features include cart management, inventory tracking, QR code generation, and live support chat.

## Recent Changes
- **Empire Architecture:** Established the core Next.js structure (Landing, Eco-Mats, Bio-Shield, Portal).
- **Database Expansion:** Drafted initial Supabase tables (B2B Orgs, Products, Bulk Orders) in `create_empire_tables.sql`.

## Next Steps
1. Construct the `create_ecosystem_tables.sql` mapping (E-commerce Cart, QR Auth, Employee Hierarchy).
2. Install `qrcode.react` to handle live manufacturing QR codes.
3. Build the Next.js Storefront layout.
