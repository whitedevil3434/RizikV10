# Rizik Voice Runbook (Cloudflare + LiveKit + Gemini 2.5 Audio)

Date: 2026-02-14
Owner: Rizik core app
Scope: Mojo Orb voice assistant with LiveKit media and Gemini native audio model

## 1) Cloudflare Services to Use

1. Cloudflare Workers (`backend/src/index.ts`)
- Provides `/api/livekit/token`
- Proxies `/api/voice/*` to `VOICE_AGENT` Durable Object
- Hosts memory APIs (`/api/memory/:userId`)

2. Cloudflare Durable Objects
- `CHAT_ROOM`: chat room state/ws routing
- `VOICE_AGENT`: voice/memory orchestration endpoint

3. Cloudflare Pages
- Frontend deployment (`https://rizik.pages.dev`) legacy visual reference

4. Cloudflare R2
- Media storage for generated assets and public delivery URLs

5. Cloudflare AI binding (optional in this stack)
- Present in `wrangler.toml` (`[ai] binding = "AI"`)
- Can be used for fallback text tools, not required for Gemini native audio path

## 2) Voice Data Path (Production)

1. Flutter app (`LiveKitService`) requests token from:
- `POST {BACKEND_URL}/api/livekit/token`

2. Worker signs LiveKit JWT using:
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

3. Flutter joins LiveKit room with mic publish + data channel.

4. Python voice agent (`backend/agent_python/main.py`) joins same room using LiveKit Agents runtime.

5. Agent uses `gemini-2.5-flash-native-audio-latest` through `livekit.plugins.google.beta.realtime.RealtimeModel`.

6. Audio is handled natively by Gemini + LiveKit. Transcript/data events flow back over LiveKit data channel.

## 3) Required Secrets (Do Not Hardcode)

Cloudflare Worker secrets:
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

Agent runtime secrets:
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `GOOGLE_API_KEY`

Flutter runtime defines:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `BACKEND_URL` (Cloudflare Worker base URL)
- optional: `LOCAL_BACKEND=true` for localhost token server
- optional: `LIVEKIT_WS_URL` to override default ws endpoint

## 4) Correct Launch Commands

### Flutter app (Cloudflare backend mode)
```bash
flutter run -d macos \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=BACKEND_URL=https://<your-worker-domain>
```

### Flutter app (Local backend mode)
```bash
flutter run -d macos \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=LOCAL_BACKEND=true
```

### Python Gemini native audio agent
```bash
cd backend/agent_python
cp .env.example .env
# Fill LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, GOOGLE_API_KEY
python main.py
```

## 5) Quality Gates

1. Token API test:
```bash
curl -X POST https://<worker-domain>/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"room":"rizik-test","participant":"tester-1"}'
```

2. Expected:
- non-empty `token` JSON field
- Flutter connects without `Connection refused` or `Failed host lookup`
- Agent logs show:
  - "Starting Rizik Gemini 2.5 Flash Native Audio Agent"
  - "Gemini Native Audio Agent active - listening!"

## 6) Notes

- 4-side reels/feed architecture remains unchanged by this runbook.
- UI style changes can be applied independently of voice transport.
