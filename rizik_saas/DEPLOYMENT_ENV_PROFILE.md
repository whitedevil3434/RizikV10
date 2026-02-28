# Deployment Environment Profile (Rizik SaaS)

## Environments
- `local`: developer machine, controlled test data
- `staging`: pre-production validation
- `production`: customer and enterprise traffic

## Required Environment Variables

### Core Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

### Access Segmentation
- `OPS_HOSTNAME`
  - Optional but recommended.
  - Example: `ops.rizik.global`
  - When set, middleware redirects `/admin` and `/portal` to this host.

### Bootstrap Security
- `SETUP_DB_KEY`
  - Required in staging and production.
  - Protects `/api/setup-db` (POST only).
  - Send via `Authorization: Bearer <SETUP_DB_KEY>` or `x-setup-key`.

### Firebase (optional if Google auth enabled)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Protected Endpoint Usage

```bash
curl -X POST "https://<your-domain>/api/setup-db" \
  -H "Authorization: Bearer $SETUP_DB_KEY"
```

Expected behavior:
- Without key: `403 forbidden`
- With valid key: setup/seed response

## CTO Release Controls
- Never deploy with missing `SUPABASE_SERVICE_ROLE_KEY`.
- Never expose service key in client bundle.
- Set `OPS_HOSTNAME` before production cutover for cleaner control-plane isolation.
- Rotate `SETUP_DB_KEY` after bootstrap tasks.
