# 📊 Rizik SaaS Research Report - Feb 28, 2026

## 🕒 1. Last Codebase Update
- **Timestamp**: Fri Jan 16 02:12:50 2026 +0600
- **Commit ID**: `e1f0657b5fd92f5b6e3ef72d9b2b9b3e794c1796`
- **Author**: Sabbir Hossen
- **Message**: `chore: add visual processing scripts and ensure full sync`

---

## 🏗️ 2. SaaS Architecture Overview
The Rizik Super-App utilizes a high-performance, hybrid cloud architecture designed for zero-egress costs and low-latency AI interactions.

### A. Frontend (The Face)
- **Framework**: Flutter 3.x
- **Platform**: Multi-platform (Android, iOS, Web).
- **Web Deployment**: Hosted on **Cloudflare Pages** (`rizik-web`).
- **Key Features**: Pinterest-style feeds, Hero transitions, role-aware theming.

### B. Backend Infrastructure (The Brain) - Cloudflare Ecosystem
- **Compute**: **Cloudflare Workers** (`rizik-backend`).
- **State Management**: **Cloudflare Durable Objects**.
    - `ChatRoom`: Handles real-time messaging and SQLite-based message history.
    - `VoiceAgent`: Orchestrates AI voice sessions and stores user "Contextual Memory".
- **Storage**: **Cloudflare R2** for images, proofs, and video reels (TikTok-style feed).
- **Intelligence**: **Workers AI** (Llama 3.1, Mistral, Whisper for STT).

### C. Backend Middleware - Vercel Deployment
- **Project**: `link-call-web` (Next.js 16)
- **Role**:
    - **LiveKit Integration**: Generates access tokens for WebRTC voice/video calls.
    - **Gemini AI Middleware**: Connects to `gemini-2.0-flash` for real-time 3D scene generation (used in the "Hybrid Portal" UI).
- **Deployment URL**: `https://link-call-web.vercel.app`

### D. Data & Auth - Supabase
- **Role**: Primary System of Record.
- **Data**: User profiles, Authentication, transaction logs, and video metadata.
- **Connection**: Integrated with Cloudflare Workers via `@supabase/supabase-js`.

---

## 🌩️ 3. Cloudflare & Vercel Deployment Deep Dive

### Cloudflare Deployment (`rizik-backend`)
- **Worker Configuration**: `wrangler.toml` defines bindings for Durable Objects, AI, and R2.
- **Security**: Uses Environment Variables for API keys (LiveKit, Groq, Google).
- **CI/CD**: Fully automated via GitHub Actions (`.github/workflows/deploy_web.yml`).

### Vercel Deployment (`link-call-web`)
- **Framework**: Next.js 16 (App Router).
- **APIs**:
    - `/api/token`: Generates JWTs for LiveKit server (`wss://rizik-ai-femz194x.livekit.cloud`).
    - `/api/gemini`: Translates natural language prompts into 3D scene JSON (models like `organic_portal`, `cyborg_bee`).
- **Middleware**: Acts as a bridge between the Flutter app and Google's Generative AI.

---

## ✅ 4. Current System Health
- **Tests**: Baseline transaction tests passed (`flutter test test/moneybag_transaction_orchestrator_test.dart`).
- **Sync**: R2 buckets and Supabase tables are synchronized as per the last commit.
