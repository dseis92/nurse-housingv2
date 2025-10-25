import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'nodejs' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Supabase server env missing' })
    }
    const supabase = createClient(supabaseUrl, serviceKey)
    const { data, error } = await supabase.rpc('expire_holds')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data ?? { expired: 0 })
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || 'Internal error' })
  }
}
