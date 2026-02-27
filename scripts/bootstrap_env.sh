#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$ROOT_DIR/.env.notes" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env.notes"
  set +a
fi

if [[ -z "${LIVEKIT_API_KEY:-}" ]] && [[ -f "$ROOT_DIR/wrangler.toml" ]]; then
  LIVEKIT_API_KEY=$(sed -n 's/^LIVEKIT_API_KEY = "\(.*\)"/\1/p' "$ROOT_DIR/wrangler.toml" | head -n1)
fi
if [[ -z "${LIVEKIT_API_SECRET:-}" ]] && [[ -f "$ROOT_DIR/wrangler.toml" ]]; then
  LIVEKIT_API_SECRET=$(sed -n 's/^LIVEKIT_API_SECRET = "\(.*\)"/\1/p' "$ROOT_DIR/wrangler.toml" | head -n1)
fi

: "${BACKEND_URL:=http://127.0.0.1:8787}"
: "${NEXT_PUBLIC_LIVEKIT_URL:=wss://rizik-ai-femz194x.livekit.cloud}"
: "${OFFLINE_MODE:=true}"

export LIVEKIT_API_KEY LIVEKIT_API_SECRET BACKEND_URL NEXT_PUBLIC_LIVEKIT_URL OFFLINE_MODE
export GEMINI_API_KEY="${GEMINI_API_KEY:-${GOOGLE_API_KEY:-}}"
