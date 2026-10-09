# Rizik Backend

This is the API backend for Rizik deployed as a Cloudflare Worker.

## Environment Variables and Secrets

Never commit secrets to `wrangler.toml` or the repository.

### Local Development

For local development, create a `.dev.vars` file in the `backend/` directory with the following secrets. **DO NOT commit this file.**

```env
# Required Secrets
FIREBASE_API_KEY="your_firebase_api_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"
SUPABASE_JWT_SECRET="your_supabase_jwt_secret_here"
LIVEKIT_API_SECRET="your_livekit_api_secret_here"

# (Optional) Cloudflare Call Secrets
CALLS_APP_SECRET="your_calls_app_secret_here"
```

To use these variables locally, run the development server via Wrangler:
`npm run dev` (run in background or separate terminal)

### Production Deployment

For production deployments via GitHub Actions, secrets are injected via GitHub Actions Secrets. The deployment pipeline expects these secrets to be present in the GitHub repository settings.

If managing secrets directly via Wrangler CLI:
npx wrangler secret put FIREBASE_API_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put SUPABASE_JWT_SECRET
npx wrangler secret put LIVEKIT_API_SECRET
