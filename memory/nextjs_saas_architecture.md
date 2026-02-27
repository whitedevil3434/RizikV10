# Rizik Global SaaS Architecture

## Core Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **UI Components:** Shadcn UI (or Aceternity UI for premium animated components)
- **Database/Auth:** Supabase
- **State Management:** Zustand (lighter than Redux, perfect for SaaS)

## Directory Structure (Proposed)
```
rizik-web/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Global layout (Nav/Footer)
│   │   ├── page.tsx            # Landing Page (B2B pitches)
│   │   ├── auth/               # Login/Signup (Supabase integration)
│   │   ├── dashboard/          # The core SaaS control panel
│   │   │   ├── admin/          # "God Mode" for Nusrat/Sabbir
│   │   │   ├── b2b/            # Client portal for Mosques/Agro buyers
│   │   │   └── retail/         # B2C analytics & future Flutter control
│   │   └── products/           # Marketing pages for specific tech
│   │       ├── eco-mats/
│   │       └── bio-shield/
│   ├── components/
│   │   ├── ui/                 # Reusable atomic units (buttons, cards)
│   │   ├── dashboard/          # Charts, data tables, order management
│   │   └── marketing/          # Hero sections, feature grids
│   ├── lib/
│   │   └── supabase/           # DB clients and queries
│   └── store/                  # Zustand state slices
```

## Key Features for Phase 1 (Launch)
1. **The "God Mode" Admin Panel:**
    - Centralized dashboard to view all metrics.
    - Ability to manage inventory for mats and packaging.
    - Invoice generation and order tracking.
2. **B2B Client Portal:**
    - A specific dashboard where a Mosque committee member or an Agro-processing manager can log in.
    - They can view their order history, download invoices, and request new shipments.
    - Integration of custom print requests for mats directly through the portal.
3. **High-Converting Landing Pages:**
    - Extreme focus on God-tier UI (Malewicz, Mizko standards).
    - Smooth scrolling, scroll-triggered animations (Framer Motion).
    - Clear value propositions for "Bio-Shield" tech and "Eco-Mats".

## Next Steps for Execution
1. Initialize the `Next.js` project in a new directory side-by-side with the Flutter app (e.g., `../rizik-web`).
2. Scaffold the basic routing and install necessary dependencies (Tailwind, Framer Motion, Supabase).
3. Create the `_product_context.md` for the web portion to maintain protocol.
