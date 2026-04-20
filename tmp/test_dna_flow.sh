#!/usr/bin/env bash
set -euo pipefail
set +H

ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTI4NzgsImV4cCI6MjA4Nzc4ODg3OH0.A5Aj5pSiDEljN0iCve3UlHgXwxCGR_jCpC0lnkIvt3A'
SERVICE='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMjg3OCwiZXhwIjoyMDg3Nzg4ODc4fQ.cOMxhnL4BjvllMx5K2UNkfHUuhC3rVhzWWSIIBLWCDg'
EMAIL='e2e.new.user.1775379813058@gmail.com'
PASS='RizikNewUser!2026'
USER_ID='dd40ecd1-1889-4723-b61a-9e5d88cec8e0'

TOKEN_JSON=$(curl -s 'https://yhwhkwveupjzrwdljivn.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: $ANON" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")

ACCESS=$(echo "$TOKEN_JSON" | jq -r '.access_token // empty')
if [ -z "$ACCESS" ]; then
  echo "TOKEN_FAIL"
  echo "$TOKEN_JSON"
  exit 1
fi

BEFORE=$(curl -s "https://yhwhkwveupjzrwdljivn.supabase.co/rest/v1/user_usage?user_id=eq.$USER_ID&select=free_uses_remaining,paid_credits" \
  -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE")

DNA=$(curl -s 'https://rizik-backend.its-sabbir69.workers.dev/api/ghost/dna' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ACCESS" \
  -d '{"text":"Today I write in mixed rhythm. Short lines. Then long, wandering explanation with random pauses and abrupt jumps because that is how my natural writing usually flows."}')

PROFILE=$(echo "$DNA" | jq -c '.profile')

HUMAN=$(curl -s 'https://rizik-backend.its-sabbir69.workers.dev/api/ghost/humanize' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ACCESS" \
  -d "{\"aiText\":\"Artificial intelligence improves productivity across industries by automating repetitive tasks and augmenting decision making.\",\"dnaProfile\":$PROFILE}")

AFTER=$(curl -s "https://yhwhkwveupjzrwdljivn.supabase.co/rest/v1/user_usage?user_id=eq.$USER_ID&select=free_uses_remaining,paid_credits" \
  -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE")

echo "BEFORE=$BEFORE"
echo "DNA=$(echo "$DNA" | jq '{success, creditsRemaining, hasProfile:(.profile!=null), profileId:.profile.id}')"
echo "HUMAN=$(echo "$HUMAN" | jq '{success, creditsRemaining, textPreview:(.text|tostring|.[0:160])}')"
echo "AFTER=$AFTER"

