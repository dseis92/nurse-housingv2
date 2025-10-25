/**
 * Generates public/config.json at build time from environment variables.
 * Falls back to an existing public/config.json if env vars are missing.
 * Safe to commit because values are public (Supabase anon key).
 */
const fs = require('fs'); const path = require('path');

const outPath = path.join(process.cwd(), 'public', 'config.json');
const envUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const envAnon = process.env.VITE_SUPABASE_ANON_KEY || '';

if (envUrl && envAnon) {
  const cfg = { VITE_SUPABASE_URL: envUrl, VITE_SUPABASE_ANON_KEY: envAnon };
  fs.writeFileSync(outPath, JSON.stringify(cfg, null, 2));
  console.log('✅ wrote public/config.json from env');
} else if (fs.existsSync(outPath)) {
  console.log('⚠️ env missing; keeping existing public/config.json');
} else {
  const cfg = { VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" };
  fs.writeFileSync(outPath, JSON.stringify(cfg, null, 2));
  console.log('⚠️ env missing and no existing config; wrote empty public/config.json');
}
