# Rizik Fullstack Local Runbook

## 1) Prepare secrets
- Ensure `/Users/sabbir/RizikV10/.env.notes` exists.
- This file is local-only and ignored by git.

## 2) Start backend worker (Cloudflare local)
```bash
cd /Users/sabbir/RizikV10
./scripts/run_worker.sh
```
- Exposes: `http://127.0.0.1:8787`
- Key endpoints:
  - `POST /api/livekit/token`
  - `GET/WS /api/chat/room/:id/ws`

## 3) Start web app (Next.js)
```bash
cd /Users/sabbir/RizikV10
./scripts/run_web.sh
```
- Exposes: `http://127.0.0.1:3000`
- Uses `link-call-web/.env.local` generated from `.env.notes`.

## 4) Start Flutter app
```bash
cd /Users/sabbir/RizikV10
./scripts/run_flutter.sh
```
- Uses:
  - `LOCAL_BACKEND=true`
  - `BACKEND_URL=http://127.0.0.1:8787`
  - `LIVEKIT_WS_URL=wss://rizik-ai-femz194x.livekit.cloud`
  - `OFFLINE_MODE=true` (default for stable local UI flow)

## 5) Optional one-shot start (worker + web)
```bash
cd /Users/sabbir/RizikV10
./scripts/run_stack.sh
```
Then run Flutter in foreground:
```bash
./scripts/run_flutter.sh
```

## 6) Smoke checks
```bash
curl http://127.0.0.1:8787/
curl -X POST http://127.0.0.1:8787/api/livekit/token \
  -H 'content-type: application/json' \
  -d '{"room":"rizik-room","participant":"test-user"}'

curl http://127.0.0.1:3000/
curl -X POST http://127.0.0.1:3000/api/token \
  -H 'content-type: application/json' \
  -d '{"room":"rizik-room","participant":"web-user"}'
```
