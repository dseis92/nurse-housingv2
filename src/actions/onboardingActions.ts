import { ensureSupabase } from '../lib/supabaseClient'

export type NurseOnboardingState = {
  full_name?: string
  location?: { city?: string; state?: string; lat?: number; lng?: number }
  lease_weeks?: number
  weekly_budget?: number
  commute_minutes_peak?: number
  pets?: string[]
  bedrooms?: number
  amenities?: string[]
  priorities?: string[]
  urgency?: string
  [k: string]: any
}

export async function saveNurseOnboarding(payload: NurseOnboardingState): Promise<void> {
  const sb = await ensureSupabase()
  if (!sb) return
  const { error } = await sb.rpc('upsert_nurse_onboarding', { p_input: payload })
  if (error) throw error
}

export async function fetchNurseOnboarding(): Promise<NurseOnboardingState | null> {
  const sb = await ensureSupabase()
  if (!sb) return null
  const { data, error } = await sb.rpc('get_nurse_onboarding')
  if (error) throw error
  return (data as NurseOnboardingState | null) ?? null
}
