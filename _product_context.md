# Rizik Product Context

## 🚀 Current Phase: V5 - The Super-Cloud Era
**Source of Truth**: `part 1&2 of Rizik.pdf`, `Rizik Backend plan .pdf` & **User Provided 52-Feature List**
**Goal**: Build the "Rizik" Super-App using a hybrid **Cloudflare + Supabase** architecture, integrating "Maker", "Mover", and "Consumer" into a seamless ecosystem.

### ✅ Recent Updates (2025-12-03)
- **Voice Pipeline**: Refactored to "Hyper-Realtime" streaming using Vercel AI SDK v4.
- **Voice UI**: Implemented `VoiceAssistantPalette` (Google-Assistant style sliding sheet) with `RizikMojo` orb.
- **State Management**: Created `VoiceSessionProvider` using Riverpod for LiveKit session handling.
- **Flutter Integration**: Wired `MojoFloatingWidget` (Long Press) to trigger the Voice Palette.
- **Backend**: Updated `AIOrchestrator` for intent detection and voice chunk injection.
- **Dependencies**: Downgraded `ai` to v4 and `zod` to v3 for compatibility.
- **Bazar Ecosystem**: Implemented "Capacity Lock" (Kitchen OS) and "Inventory Voice-Log" (AI).
- **Backend**: Added `OperationalEngine`, `SquadService`, `InventoryService`, and exposed endpoints.
- **AI**: Trained `AIOrchestrator` for inventory management.
- **Frontend**: Created `CapacityToggleWidget` and updated `Squad` model.
- **Build Fix**: Fixed `VoiceInputService.dart` build errors (AudioEncoder & missing methods).
- **Cloudflare Stack**: Finalized "All-in-Cloudflare" architecture with Azure TTS. from that entirely remove that


## 🏗️ Architecture (The "Super-Cloud" Stack)
- **Frontend**: Flutter (Riverpod 2.0, Freezed, Skeletonizer)
- **Backend Compute**: Cloudflare Workers (Hono.js)
- **State & Real-time**: Cloudflare Durable Objects (SQLite Edition) + Cloudflare Workflows
- **Database**: 
    - **Supabase**: Auth, User Profiles, Transaction Logs (Long-term storage)
    - **Cloudflare DO (SQLite)**: Live State, Squad Chat, Order Status (Hot storage)
    - **Connection**: Cloudflare Hyperdrive (Connection Pooling)
- **AI & Intelligence**: 
    - **Brain**: Workers AI (Llama 3.1, Mistral)
    - **Memory**: Vectorize (Vector DB)
    - **Voice**: Cloudflare Calls (WebRTC) + Whisper
- **Storage**: Cloudflare R2 (Images, Proofs) + Cloudflare Stream (Reels)

## 🌟 RIZIK V10: The Ultimate Ecosystem Feature List (52 Features)

### 1. SOURCE ROLE (The Provider)
**A. Kitchen OS & Squad Management**
1.  **Squad Creation**: Team formation with roles (Chef, Cutter, Buyer).
2.  **Dual-Mode Khata**: Separate "Mess Khata" (Consumption) & "Business Khata" (Profit).
3.  **Duty Roster OS**: Automated scheduling for cooking/shopping.
4.  **Income Splitting Algorithm (3-Factor)**: Auto-split profits based on roles.
5.  **Capacity Lock**: Auto-stop orders based on stove capacity.
6.  **Inventory Voice-Log**: Voice-based stock entry.
7.  **Active Recipe Book**: Auto-deduct ingredients from inventory.

**B. Asset & Micro-Shop**
8.  **Rizik Share**: Rent idle assets (Fridge space, Drill, Camera).
9.  **Rizik Vault**: Rent unused space for storage.
10. **Power Buy**: Wholesale group buying for cost reduction.
11. **Hyperlocal Micro-Services**: Home-based services (Spice grinding, Printing, Pet sitting).
12. **Rizik Rescue**: Sell leftover food as Mystery Boxes.

### 2. FORCE ROLE (The Action)
**A. Logistics Force**
13. **Mission Chain OS**: Chain tasks (Pickup + Delivery + Shop) to avoid empty trips.
14. **Squad Dispatcher**: Manage teams for large moves.
15. **Mover Float**: Daily micro-loans for riders.
16. **Rizik Carrier**: Inter-district parcel carrying in empty luggage space.
17. **Visual Proof Audit**: Photo/Video proof of item condition.

**B. Student Micro-Economy**
18. **Rizik Jomi (Civil)**: Land measurement, soil test.
19. **Rizik Circuit (EEE/CSE)**: PC build, repair, data recovery.
20. **Rizik Lab (Pharmacy/Biochem)**: Chemical testing of meds/cosmetics.
21. **Rizik Export (IR/English)**: Chat with foreign buyers, draft emails.
22. **Rizik Space (Arch)**: Budget interior design/renovation.
23. **Rizik Listener (Psych)**: Non-judgmental listening support.
24. **Rizik Nature (Agri)**: Roof garden care, plant disease diagnosis.
25. **Rizik Scribe (Lit)**: Letter writing, social media captions.

**C. The "Grey/Dark" Economy Hacks**
26. **Rizik Nudge**: Social pressure for debt recovery.
27. **Rizik Protocol**: Fake protocol/bodyguards for show-off.
28. **Rizik Cover**: Professional alibis/fake calls.
29. **Rizik Tenant-Intel**: Secret intel on landlords/tenants.
30. **Rizik BidWar**: Reverse auction for services.
31. **Rizik Queue/Proxy**: Line standing or proxy attendance.

**D. Madrasa & Spiritual Fusion**
32. **Rizik Akhirah**: Funeral management service.
33. **Rizik Halal-Check**: Halal process verification.
34. **Rizik Wasiyat**: Sharia inheritance calculation & legal drafts.

### 3. SEEKER ROLE (The Receiver)
**A. Ordering & Lifestyle**
35. **Rizik Now**: Instant on-demand ordering.
36. **Rizik Kitchen**: Monthly meal subscription.
37. **Rizik Dawat**: Chef/Server rental for events.

**B. Household Operating System**
38. **Smart Shongshar Khata**: Expense tracking & savings advice.
39. **Sanchoy Pot**: Micro-savings from expense cuts.
40. **Bua OS**: Maid/Babysitter management & payments.
41. **Utility Auto-Collector**: Auto-collect bills from flatmates.

### 4. CORE TECHNOLOGY & FINTECH (The Engine)
**A. Fintech & Money**
42. **Shared Squad Wallet (Tohobil)**: Common capital fund.
43. **Rizik Dhaar**: Trust-based voucher loans (Social Collateral).
44. **Hyperlocal Escrow**: Payment lock until service satisfaction.
45. **Digital Shomiti**: Neighborhood savings & lottery.

**B. AI & Intelligence**
46. **Rizik Co-Pilot**: Voice-commanded app operation (Bangla/Banglish).
47. **Predictive Kitchen OS**: Profit-based cooking suggestions.
48. **Contextual Memory**: Personalized user experience.

**C. Trust & Security**
49. **Rizik Passport**: Verified public profile (NID/Student ID).
50. **Squad Tribunal**: Internal dispute resolution & voting.
51. **Dynasty Sentinel**: Community safety network.
52. **Digital Handover**: Visual proof during handovers.

## 📂 Key Files & Directories
- `lib/main.dart`: App Entry (Bootstrap).
- `lib/app_bootstrap.dart`: Titanium Initialization.
- `lib/routes.dart`: GoRouter Configuration.
- `lib/core/di/dependency_injection.dart`: Service Locator.
- `lib/features/`: Feature-first architecture.
- `functions/`: Cloudflare Workers (to be created).
- `wrangler.toml`: Cloudflare configuration (to be created).

## ⚠️ Known Constraints
- **Strict R2 Usage**: No AWS S3 SDKs.
- **Type Safety**: Strict TypeScript for Workers, Dart for Flutter.
- **Cost Strategy**: Zero egress fees (R2), Serverless compute.
