#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/bootstrap_env.sh"

cat > "$ROOT_DIR/link-call-web/.env.local" <<ENV
LIVEKIT_API_KEY=${LIVEKIT_API_KEY:-}
LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET:-}
GEMINI_API_KEY=${GEMINI_API_KEY:-}
NEXT_PUBLIC_LIVEKIT_URL=${NEXT_PUBLIC_LIVEKIT_URL}
ENV

echo "Starting link-call-web on http://127.0.0.1:3000"
cd "$ROOT_DIR/link-call-web"
npm run dev -- --hostname 127.0.0.1 --port 3000
