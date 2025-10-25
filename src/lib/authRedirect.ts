/**
 * Picks the redirect URL for Supabase email/OAuth callbacks.
 * Priority:
 *  1) VITE_REDIRECT_URL (set explicitly in .env.local when testing across devices)
 *  2) window.location.origin (same-machine dev)
 */
export function getAuthRedirectURL(): string {
  const env = (import.meta as any)?.env
  const fromEnv = (env?.VITE_REDIRECT_URL as string | undefined)?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return window.location.origin.replace(/\/$/, '')
}
