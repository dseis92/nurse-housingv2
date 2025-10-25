#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="${1:-$HOME/dev/nurse-app/nurse-housingv2}"
cd "$BASE_DIR" 2>/dev/null || { echo "❌ Base dir not found: $BASE_DIR"; exit 2; }

echo "🔎 Verifying project at: $PWD"
echo

missing=()

need_dir() {
  local d="$1"
  if [ -d "$d" ]; then
    echo "✅ dir  $d"
  else
    echo "❌ dir  $d"
    missing+=("dir:$d")
  fi
}

need_file() {
  local f="$1"
  if [ -f "$f" ]; then
    echo "✅ file $f"
  else
    echo "❌ file $f"
    missing+=("file:$f")
  fi
}

need_any() {
  local label="$1"; shift
  local found=0
  for cand in "$@"; do
    if [ -e "$cand" ]; then
      echo "✅ any  $label → $cand"
      found=1
      break
    fi
  done
  if [ "$found" -eq 0 ]; then
    echo "❌ any  $label (none found: ${*@Q})"
    missing+=("any:$label")
  fi
}

echo "• Core files"
need_file "package.json"
need_any  "Vite config" "vite.config.ts" "vite.config.js"
need_file "index.html"
need_any  "TypeScript config" "tsconfig.json" "tsconfig.app.json"
need_any  "Tailwind config" "tailwind.config.ts" "tailwind.config.js"
need_any  "PostCSS config (optional)" "postcss.config.js" "postcss.config.cjs"
echo

echo "• Source layout"
need_dir "src"
need_any  "Global stylesheet" "src/index.css" "src/styles/tailwind.css" "src/styles/tailwind-output.css"
need_file "src/main.tsx"
need_file "src/App.tsx"
need_dir "src/components"
need_dir "src/pages"
need_dir "src/stores"
need_dir "public"
echo

echo "• Env"
if [ -f ".env.local" ]; then
  echo "✅ env  .env.local"
else
  echo "⚠️  env  .env.local (not found — ok if using mocks)"
fi
echo

echo "• Node & npm"
if command -v node >/dev/null 2>&1; then node -v; else echo "❌ node not installed"; missing+=("tool:node"); fi
if command -v npm  >/dev/null 2>&1; then npm -v;  else echo "❌ npm not installed";  missing+=("tool:npm");  fi
echo

echo "• node_modules"
if [ -d "node_modules" ]; then
  echo "✅ deps node_modules present"
else
  echo "❌ deps node_modules missing (run: npm install)"
  missing+=("deps:node_modules")
fi
echo

echo "• package.json dependencies check"
node - <<'JS' || { echo "❌ dependency check failed (Node issue)"; exit 1; }
const fs = require('fs');
const chalk = new Proxy({}, {get:(_,k)=> (s)=>s}); // no color to keep CI-friendly
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const deps = {...(pkg.dependencies||{}), ...(pkg.devDependencies||{})};
const required = [
  'react','react-dom','typescript','vite','@vitejs/plugin-react'
];
const recommended = [
  'tailwindcss','@tailwindcss/vite',
  'zustand','@supabase/supabase-js',
  'react-router-dom','lucide-react',
  'vite-plugin-pwa','framer-motion'
];
let miss = 0;
for (const name of required) {
  if (deps[name]) console.log(`✅ req  ${name}@${deps[name]}`);
  else { console.log(`❌ req  ${name} (missing)`); miss++; }
}
for (const name of recommended) {
  if (deps[name]) console.log(`✅ rec  ${name}@${deps[name]}`);
  else console.log(`⚠️  rec  ${name} (optional/not found)`);
}
process.exit(miss ? 10 : 0);
JS
echo

echo "• Optional PWA assets"
need_any "Web App Manifest" "public/manifest.webmanifest" "public/manifest.json"
need_any "PWA icons" "public/pwa-192.png" "public/pwa-512.png" "public/icons/icon-192.png" "public/icons/icon-512.png"
echo

echo "• Summary"
if [ "${#missing[@]}" -eq 0 ]; then
  echo "✅ All required checks passed."
  exit 0
else
  echo "❌ Missing items:"
  for m in "${missing[@]}"; do echo "   - $m"; done
  exit 1
fi
