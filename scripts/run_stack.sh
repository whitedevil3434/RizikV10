#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$ROOT_DIR/.local/logs"

"$ROOT_DIR/scripts/run_worker.sh" > "$ROOT_DIR/.local/logs/worker.log" 2>&1 &
echo $! > "$ROOT_DIR/.local/logs/worker.pid"

"$ROOT_DIR/scripts/run_web.sh" > "$ROOT_DIR/.local/logs/web.log" 2>&1 &
echo $! > "$ROOT_DIR/.local/logs/web.pid"

echo "Worker/Web started. Logs: .local/logs/*.log"
echo "Run Flutter in foreground: ./scripts/run_flutter.sh"
