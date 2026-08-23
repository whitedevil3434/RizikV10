#!/usr/bin/env bash
set -euo pipefail

LABEL="ai.openclaw.gateway"
UID_NUM="$(id -u)"
DOMAIN="gui/${UID_NUM}"

echo "[openclaw] Stopping ${DOMAIN}/${LABEL} ..."
launchctl bootout "${DOMAIN}/${LABEL}" 2>/dev/null || true
echo "[openclaw] Stopped."

