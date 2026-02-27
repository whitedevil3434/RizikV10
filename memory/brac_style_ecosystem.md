# The Rizik Ecosystem: BRAC-Style ERP Architecture

## Inspiration: The BRAC Model
BRAC (the world's largest NGO) operates via a massive central holding structure supported by specialized subsidiaries (Aarong, bKash, BRAC Bank, BRAC IT Services). They utilize a highly customized, centralized Enterprise Resource Planning (ERP) system that connects supply chain management, human resources, accounting, and consumer retail under one secure roof.

## Replicating the Ecosystem for "Rizik Global"
Rizik will act as the "Mother Company" (The Brain), while Eco-Mats and Bio-Shield act as the specialized operational arms. The SaaS application is the central nervous system.

### Core Modules of the Rizik SaaS (The "Heart")

#### 1. Centralized Identity & Access Management (BRAC IT Style)
*   **The Board Room (Super Admins):** The Founding Board (Sabbir, Nusrat) has absolute visibility to all subsidiaries' revenue and raw data.
*   **Subsidiary Heads (Directors):** Can only see data for their specific branch (e.g., Head of Eco-Mats cannot view the Bio-Shield chemical inventory).
*   **Artisans & Workers (The Aarong Model):** The rural workforce in Barishal (weavers) have minimal-access accounts to scan QR codes and mark batches as "Completed" to receive their piece-rate digital payments.
*   **Customers (B2B & B2C):** Client portals to place orders and track logistics.

#### 2. Supply Chain & Manufacturing ERP (The Aarong Model)
*   **Raw Material Tracking:** Tracking incoming Chitosan, Collagen, LDPE rolls, and bio-degradable fibers.
*   **Decentralized Production:** (Like Aarong's rural artisan network). The SaaS issues "Production Orders" to specific hubs in Barishal.
*   **QA & QR Tagging:** Once a batch is done, the SaaS generates a cryptographic QR sequence. Scanning it verifies product authenticity and logs it into the "Ready for Dispatch" inventory.

#### 3. B2B & B2C Unified E-Commerce (The Hybrid Approach)
*   Instead of separate apps, a user's `Auth Role` determines their UI.
*   A normal user sees the consumer catalog (buying 1 mat).
*   An "Agro-Corp" account logs in and sees bulk pricing for Bio-Shield retort pouches with a minimum order quantity (MOQ) of 10,000 units, complete with localized invoicing and automated tax calculation.

#### 4. The Digital Wallet / Ledger (The bKash Node)
*   Internal accounting. Tracking how much is owed to the Barishal artisans per QR code scanned. Will serve as the foundation when we eventually build "Rizik Pay" for instant worker settlements.

### Technical Foundation (Next.js + Supabase)
We are evolving `rizik_saas` from a landing page into a full Application Shell. 
*   **Brand Aesthetic:** Moving from dark neon green to the official Rizik Corporate Identity: "Old Money Cream" (`#F5F2EB`) and "Trust Navy" (`#031E49`). This projects massive scale, stability, and institutional trust, exactly like a major corporate bank or NGO.
*   **Data Models:** Supabase RLS (Row Level Security) will act as the firewall between subsidiaries, ensuring data isolation.
