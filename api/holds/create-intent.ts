import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'nodejs' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const { matchId, amountCents = 2000 } = req.body || {}
    if (!matchId) return res.status(400).json({ error: 'matchId required' })

    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const stripeKey   = process.env.STRIPE_SECRET_KEY

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Supabase server env missing' })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // 1) create hold row
    const { data: holdRes, error: holdErr } = await supabase.rpc('create_hold', { p_match_id: matchId, p_amount_cents: amountCents })
    if (holdErr) return res.status(500).json({ error: holdErr.message })
    const holdId = holdRes?.hold_id

    // 2) create Stripe intent (optional in dev)
    let client_secret: string | undefined
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })
      const intent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        capture_method: 'manual',
        automatic_payment_methods: { enabled: true },
        metadata: { holdId, matchId },
      })
      client_secret = intent.client_secret || undefined
      await supabase.from('holds').update({ client_secret, status: 'active' }).eq('id', holdId)
    }

    return res.status(200).json({ holdId, client_secret })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Internal error' })
  }
}
