#!/usr/bin/env bash
set -euo pipefail
ENV_FILE="${1:-.env.local}"
[ -f "$ENV_FILE" ] || { echo "❌ $ENV_FILE not found"; exit 1; }
VITE_SUPABASE_URL="$(grep -E '^VITE_SUPABASE_URL=' "$ENV_FILE" | sed 's/^[^=]*=//')"
VITE_SUPABASE_ANON_KEY="$(grep -E '^VITE_SUPABASE_ANON_KEY=' "$ENV_FILE" | sed 's/^[^=]*=//')"
mkdir -p public
cat > public/config.json <<JSON
{
  "VITE_SUPABASE_URL": "$VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY": "$VITE_SUPABASE_ANON_KEY"
}
JSON
echo "✅ wrote public/config.json from $ENV_FILE"
