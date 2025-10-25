#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.local}"
echo "🔎 Checking $ENV_FILE in $(pwd)"
echo

# 1) Exists + permissions
if [ -f "$ENV_FILE" ]; then
  echo "✅ Found: $ENV_FILE"
  ls -la "$ENV_FILE"
else
  echo "❌ Not found: $ENV_FILE"
  exit 1
fi
echo

# 2) Git ignore status (should be ignored & not tracked)
echo "• Git ignore/track status"
git check-ignore -v "$ENV_FILE" && echo "✅ Ignored by git" || echo "⚠️ Not explicitly ignored (add .env* to .gitignore)"
if git ls-files --error-unmatch "$ENV_FILE" >/dev/null 2>&1; then
  echo "❌ $ENV_FILE is tracked by git (remove it and commit .gitignore)"
else
  echo "✅ Not tracked by git"
fi
echo

# 3) Required keys present & non-empty (mask output)
echo "• Required keys"
req=(VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY)
missing=0
for k in "${req[@]}"; do
  val="$(grep -E "^${k}=" "$ENV_FILE" | sed 's/^[^=]*=//')"
  if [ -z "$val" ]; then
    echo "❌ $k missing or empty"
    missing=1
  else
    prefix="${val:0:24}"
    len="${#val}"
    echo "✅ $k = ${prefix}… (len: ${len})"
  fi
done
echo

# 4) Sanity on file encoding/line endings
echo "• File encoding"
file "$ENV_FILE" || true
echo "• Check for CRLF (should be 0)"
cr=$(( $(grep -U $'\r' -n "$ENV_FILE" | wc -l | tr -d ' ') ))
echo "CRLF lines: $cr"
if [ "$cr" -gt 0 ]; then echo "⚠️ Found CRLF. Consider: dos2unix $ENV_FILE"; fi
# BOM check
printf "• BOM bytes: "
xxd -p -l 3 "$ENV_FILE" | tr -d '\n'; echo
echo

# 5) Show currently exported values in the shell (if any)
echo "• Current shell env (if exported)"
echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-<unset>}"
echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:+<set>}${VITE_SUPABASE_ANON_KEY:-<unset>}" | sed 's/<set>/<set (masked)>/'

# 6) If Vercel envs were pulled, compare .env.local to .vercel/.env.production.local and .env.preview.local
if [ -f ".vercel/.env.production.local" ]; then
  echo
  echo "• Compare with .vercel/.env.production.local"
  prod_url="$(grep -E '^VITE_SUPABASE_URL=' .vercel/.env.production.local | sed 's/^[^=]*=//')"
  prod_key="$(grep -E '^VITE_SUPABASE_ANON_KEY=' .vercel/.env.production.local | sed 's/^[^=]*=//')"
  loc_url="$(grep -E '^VITE_SUPABASE_URL=' "$ENV_FILE" | sed 's/^[^=]*=//')"
  loc_key="$(grep -E '^VITE_SUPABASE_ANON_KEY=' "$ENV_FILE" | sed 's/^[^=]*=//')"

  [ "$prod_url" = "$loc_url" ] && echo "✅ URL matches PROD" || echo "⚠️ URL differs from PROD"
  [ "$prod_key" = "$loc_key" ] && echo "✅ ANON KEY matches PROD" || echo "⚠️ ANON KEY differs from PROD"
fi

echo
echo "✅ Done."
[ "$missing" -eq 0 ]
