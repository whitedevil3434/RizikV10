# 🌩️ Rizik Cloudflare Edition: Architectural Blueprint

## 🎯 Mission Statement
To maintain the "Soul" (Frontend Experience) of Rizik while transplanting the "Brain" (Backend Intelligence) to a serverless, zero-egress Cloudflare ecosystem.

## 🏗️ 1. The Core Infrastructure (Cloudflare Native)

### A. The "Voice Agent" (Durable Object)
Instead of a VPS running Python, each active voice session becomes a **Cloudflare Durable Object**.
*   **Role:** Session Orchestrator.
*   **Capabilities:**
    *   Maintains conversation history (State).
    *   Connects to **Workers AI** (Llama 3 / Mistral) for intelligence.
    *   Connects to **Cloudflare Calls** (SFU) for WebRTC signaling.
    *   Streams Text Tokens via WebRTC Data Channels.

### B. The "Zero-Egress" Audio Pipeline
We eliminate server-side TTS audio generation to save bandwidth and avoid blocking.
*   **Input (STT):** Client streams audio -> Cloudflare Calls -> Workers AI (Whisper) -> Text.
*   **Logic (LLM):** Text -> Workers AI (Llama 3) -> Response Text Stream.
*   **Output (TTS):** Response Text -> **Client Side Synthesis** (Distributed Swarm).

---

## 🗣️ 2. The "Distributed Swarm" TTS Strategy (Edge-TTS)

### The Problem
Using a central server to hit Microsoft's `edge-tts` API results in IP bans due to rate limiting.

### The Solution: "Client-as-a-Node"
Every Rizik App instance acts as an independent browser interacting with Microsoft.
*   **1 User = 1 IP:** Zero risk of IP bans.
*   **Infinite Scalability:** No server load for audio generation.

### The "Remote Safety Net" Protocol
To prevent the app from breaking if Microsoft changes their API:
1.  **Boot Config:** On app launch, Client fetches `tts_config` from Cloudflare KV.
    ```json
    {
      "wss_url": "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
      "headers": { "Trusted-Client-Token": "6A5AA1D4EAFF4E9FB37E23D68491D6F4" },
      "voice": "bn-BD-PradeepNeural"
    }
    ```
2.  **Dynamic Adaptation:** If they change the URL, we update KV, and all apps switch instantly.

---

## ⚡ 3. Realtime Data Flow (The "Nerves")

### Step-by-Step Flow
1.  **User Speaks:** Flutter `UniversalRecorder` captures audio -> WebRTC Track -> Cloudflare SFU.
2.  **Transcribing:** Cloudflare Worker (attached to SFU) chunks audio -> Whisper (STT).
3.  **Thinking:** STT Text -> Durable Object (History) -> Workers AI (LLM).
4.  **Streaming Response:**
    *   **Path A (Text):** LLM Tokens -> **WebRTC Data Channel** -> Flutter Client (Instant display).
    *   **Path B (Audio Trigger):** Client receives text chunk -> **Local Edge-TTS Engine** -> Plays Audio.

---

## 🛠️ 4. Implementation Roadmap

### Phase 1: The Foundation
-   [ ] Create `VoiceAgent` Durable Object class.
-   [ ] Configure `wrangler.toml` for Workers AI and Realtime capabilities.

### Phase 2: The "Swarm" Client
-   [ ] Implement `EdgeTTSClient` in Dart (Custom WSS handler).
-   [ ] Build `RemoteConfigService` to fetch WSS parameters.

### Phase 3: The Transplant
-   [ ] Refactor `VoiceSessionProvider` to use `ChatRepository` (WebSocket) and new `EdgeTTSClient`.
-   [ ] Remove legacy `GeminiLiveService`.

---
*Architected by Apex-G3*
