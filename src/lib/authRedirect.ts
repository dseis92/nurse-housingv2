export function getAuthRedirectURL(): string {
  const env: any = (import.meta as any)?.env || {}
  // In dev, always use the current origin (prevents NXDOMAIN when links are opened on another device)
  if (env?.DEV) {
    return window.location.origin.replace(/\/$/, '')
  }
  const fromEnv = (env?.VITE_REDIRECT_URL as string | undefined)?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return window.location.origin.replace(/\/$/, '')
}
