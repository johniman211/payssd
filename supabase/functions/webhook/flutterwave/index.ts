import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

Deno.serve(async (req) => {
  const payload = await req.json()
  const ref = payload?.data?.tx_ref || payload?.tx_ref || null
  const status = payload?.data?.status || payload?.status || null
  if (!ref) return new Response(JSON.stringify({ ok: false, error: 'missing_reference' }), { status: 400 })
  const { data: payments } = await client.from('payments').select('*').eq('flutterwave_reference', ref)
  if (payments && payments.length) {
    for (const p of payments) {
      await client.from('payments').update({ status: status === 'successful' ? 'completed' : status === 'failed' ? 'failed' : 'pending', updated_at: new Date().toISOString() }).eq('id', p.id)
      await client.from('payment_logs').insert({ payment_id: p.id, event: 'webhook', data: payload })
    }
  }
  return new Response(JSON.stringify({ ok: true }))
})
