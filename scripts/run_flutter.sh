#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/bootstrap_env.sh"

cd "$ROOT_DIR"
flutter run -d macos \
  --dart-define=LOCAL_BACKEND=true \
  --dart-define=BACKEND_URL=${BACKEND_URL} \
  --dart-define=LIVEKIT_WS_URL=${NEXT_PUBLIC_LIVEKIT_URL} \
  --dart-define=OFFLINE_MODE=${OFFLINE_MODE}
