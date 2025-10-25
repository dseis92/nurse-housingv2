#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.local}"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found"; exit 1
fi

# load .env.local into current shell (basic parser: ignores comments/blank lines)
export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | sed 's/#.*//')

# Derive server-only SUPABASE_URL from VITE_ value if not present
: "${SUPABASE_URL:=${VITE_SUPABASE_URL:-}}"

# require Vercel CLI project link
vercel link --yes >/dev/null 2>&1 || vercel link

add() {
  local KEY="$1" ENV="$2" VAL="$3"
  [ -z "$VAL" ] && { echo "⚠️  $KEY is empty; skip ($ENV)"; return; }
  # remove existing then add the new value
  vercel env rm "$KEY" "$ENV" -y >/dev/null 2>&1 || true
  printf "%s" "$VAL" | vercel env add "$KEY" "$ENV" >/dev/null
  echo "✅ set $KEY → $ENV"
}

# push to both preview & production
for TARGET in preview production; do
  add VITE_SUPABASE_URL            "$TARGET" "${VITE_SUPABASE_URL:-}"
  add VITE_SUPABASE_ANON_KEY       "$TARGET" "${VITE_SUPABASE_ANON_KEY:-}"
  add SUPABASE_URL                 "$TARGET" "${SUPABASE_URL:-}"
  add SUPABASE_SERVICE_ROLE_KEY    "$TARGET" "${SUPABASE_SERVICE_ROLE_KEY:-}"
  add STRIPE_SECRET_KEY            "$TARGET" "${STRIPE_SECRET_KEY:-}"
done

echo "🎯 Done syncing envs from $ENV_FILE to Vercel."
