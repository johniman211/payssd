import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)
const FLW_LIVE_SECRET = Deno.env.get('FLW_LIVE_SECRET') || ''

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const merchantId = body.merchant_id as number
    const amount = body.amount as number
    const currency = body.currency || 'SSP'
    if (!merchantId || !amount) return new Response(JSON.stringify({ ok: false, error: 'missing_parameters' }), { status: 400 })

    const { data: kyc } = await client.from('merchant_kyc').select('*').eq('merchant_id', merchantId).eq('status','approved').single()
    if (!kyc) return new Response(JSON.stringify({ ok: false, error: 'kyc_required' }), { status: 403 })

    const { data: payout } = await client.from('payouts').insert({ merchant_id: merchantId, amount, currency, status: 'requested' }).select('*').single()

    if (!FLW_LIVE_SECRET) return new Response(JSON.stringify({ ok: true, payout_id: payout.id, simulated: true }), { headers: { 'Content-Type': 'application/json' } })

    const res = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FLW_LIVE_SECRET}` },
      body: JSON.stringify({ amount, currency: 'SSP', reference: `PSSD_PAYOUT_${payout.id}`, narration: 'Merchant payout', beneficiary_name: kyc.bank_account_name, account_number: kyc.bank_account_number, bank_code: kyc.bank_code })
    })
    const data = await res.json()
    await client.from('payouts').update({ status: res.status < 400 ? 'processing' : 'failed', flutterwave_transfer_id: data?.data?.id || null, updated_at: new Date().toISOString() }).eq('id', payout.id)
    return new Response(JSON.stringify({ ok: res.status < 400, payout_id: payout.id, flutterwave: data }), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
