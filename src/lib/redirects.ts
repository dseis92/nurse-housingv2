export function getDevCallback(): string {
  // use 127.0.0.1 instead of "localhost" to dodge odd DNS/client rewrites
  const port = location.port || '5173'
  return `http://127.0.0.1:${port}/auth/callback`
}
export function getProdCallback(): string {
  // Prefer env, fall back to your deployed domain
  const env: any = (import.meta as any)?.env || {}
  const base = (env.VITE_SITE_URL || env.VITE_REDIRECT_URL || 'https://nurse-housingv2.vercel.app')
    .toString().replace(/\/$/, '')
  return `${base}/auth/callback`
}
