#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-3000}"
HOST="${HOST:-127.0.0.1}"

PIDS="$(lsof -t -iTCP:${PORT} -sTCP:LISTEN -n -P 2>/dev/null || true)"
if [ -n "$PIDS" ]; then
  echo "Stopping existing processes on port ${PORT}: $PIDS"
  # shellcheck disable=SC2086
  kill -TERM $PIDS || true
  sleep 1
fi

if command -v trash >/dev/null 2>&1; then
  trash .next 2>/dev/null || true
else
  rm -rf .next
fi

echo "Starting clean Next.js dev server on ${HOST}:${PORT}"
exec npx next dev --hostname "$HOST" --port "$PORT"
