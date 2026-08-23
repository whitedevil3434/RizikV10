#!/usr/bin/env bash
set -euo pipefail

LABEL="ai.openclaw.gateway"
UID_NUM="$(id -u)"
DOMAIN="gui/${UID_NUM}"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"

if [[ ! -f "${PLIST}" ]]; then
  echo "[openclaw] Missing plist: ${PLIST}" >&2
  exit 1
fi

echo "[openclaw] Bootstrapping ${PLIST} ..."
launchctl bootstrap "${DOMAIN}" "${PLIST}" 2>/dev/null || true

echo "[openclaw] Kickstarting ${DOMAIN}/${LABEL} ..."
launchctl kickstart -k "${DOMAIN}/${LABEL}"
echo "[openclaw] Running."

