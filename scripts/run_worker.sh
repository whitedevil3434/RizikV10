#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/bootstrap_env.sh"

if [[ -z "${LIVEKIT_API_KEY:-}" || -z "${LIVEKIT_API_SECRET:-}" ]]; then
  echo "Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET (check .env.notes)"
  exit 1
fi

cat > "$ROOT_DIR/.dev.vars" <<VARS
LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
AI_MODEL_NAME=@cf/meta/llama-3.1-8b-instruct
AI_MODEL_FALLBACK=@cf/meta/llama-3.1-8b-instruct
GROQ_API_KEY=${GROQ_API_KEY:-}
VARS

echo "Starting Cloudflare worker on http://127.0.0.1:8787"
cd "$ROOT_DIR"
npm run dev -- --local --ip 127.0.0.1 --port 8787
