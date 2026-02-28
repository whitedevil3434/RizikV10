#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"

check_url() {
  local url="$1"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url")"
  echo "$code $url"
  if [ "$code" -ge 400 ]; then
    return 1
  fi
}

check_url "${BASE_URL}/"
check_url "${BASE_URL}/fair"
check_url "${BASE_URL}/cart"

HTML_FILE="$(mktemp)"
curl -sS "${BASE_URL}/fair" > "$HTML_FILE"

ASSETS="$(perl -nle 'while(/(?:src|href)=\"([^\"]+)\"/g){print $1}' "$HTML_FILE" | rg '^/_next/static/(css|chunks)' | sort -u)"
if [ -z "$ASSETS" ]; then
  echo "No _next static assets found in fair page HTML."
  exit 1
fi

while IFS= read -r asset; do
  check_url "${BASE_URL}${asset}"
done <<< "$ASSETS"

echo "Next runtime health OK"
