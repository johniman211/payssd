import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)
const FLW_TEST_SECRET = Deno.env.get('FLW_TEST_SECRET') || ''
const FLW_LIVE_SECRET = Deno.env.get('FLW_LIVE_SECRET') || ''

const flwFetch = async (path: string, secret: string, body: unknown) => {
  const res = await fetch(`https://api.flutterwave.com/v3/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  return { status: res.status, data }
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })
  }
  try {
    let body: any
    try {
      body = await req.json()
    } catch {
      const text = await req.text()
      try {
        body = JSON.parse(text)
      } catch {
        return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })
      }
    }
    const merchantId = body.merchant_id as string
    const amount = Number(body.amount)
    const currency = (body.currency as string) || 'SSP'
    const linkCode = (body.link_code as string) || null
    const customerEmail = (body.customer_email as string) || null
    if (!merchantId || !amount) return new Response(JSON.stringify({ ok: false, error: 'missing_parameters' }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })

    if (!url || !key) {
      return new Response(JSON.stringify({ ok: false, error: 'server_misconfigured', missing: ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'].filter((v)=>!Deno.env.get(v)) }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors } })
    }
    const { data: merchant } = await client.from('merchants').select('*').eq('id', merchantId).single()
    if (!merchant) return new Response(JSON.stringify({ ok: false, error: 'merchant_not_found' }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })

    const verified = merchant?.verification_status === 'approved'
    const rejected = merchant?.verification_status === 'rejected'
    if (rejected) return new Response(JSON.stringify({ ok: false, error: 'payments_not_allowed' }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })
    const hasLiveSecret = !!FLW_LIVE_SECRET
    let mode = verified && hasLiveSecret ? 'live' : 'test'
    let secret = mode === 'live' ? FLW_LIVE_SECRET : FLW_TEST_SECRET

    const { data: payment } = await client.from('payments').insert({ merchant_id: merchantId, amount, currency, status: 'pending', mode, link_code: linkCode || null, customer_email: customerEmail || null }).select('*').single()

    if (mode === 'test' && !secret) {
      await client.from('payments').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', payment.id)
      await client.from('payment_logs').insert({ payment_id: payment.id, event: 'test_complete', data: { amount, currency } })
      return new Response(JSON.stringify({ ok: true, payment_id: payment.id, test_simulated: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })
    }

    const chargeBody = {
      amount,
      currency,
      tx_ref: `PSSD_${payment.id}_${Date.now()}`,
      redirect_url: body.redirect_url || '',
      customer: { email: customerEmail || 'customer@example.com' }
    }
    let status = 0
    let data: any = null
    try {
      const res = await flwFetch('payments', secret, chargeBody)
      status = res.status
      data = res.data
    } catch (e) {
      if (mode === 'test') {
        await client.from('payments').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', payment.id)
        await client.from('payment_logs').insert({ payment_id: payment.id, event: 'test_fallback_complete', data: { amount, currency } })
        return new Response(JSON.stringify({ ok: true, payment_id: payment.id, test_simulated: true }), { headers: { 'Content-Type': 'application/json', ...cors } })
      }
      return new Response(JSON.stringify({ ok: false, error: 'provider_unreachable' }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })
    }
    await client.from('payment_logs').insert({ payment_id: payment.id, event: 'charge_init', data })
    const ref = data?.data?.tx_ref || chargeBody.tx_ref
    await client.from('payments').update({ flutterwave_reference: ref }).eq('id', payment.id)
    if (mode === 'test' && status >= 400) {
      await client.from('payments').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', payment.id)
      await client.from('payment_logs').insert({ payment_id: payment.id, event: 'test_fallback_complete', data: { amount, currency } })
      return new Response(JSON.stringify({ ok: true, payment_id: payment.id, test_simulated: true, flutterwave: data }), { headers: { 'Content-Type': 'application/json', ...cors } })
    }
    return new Response(JSON.stringify({ ok: status < 400, payment_id: payment.id, flutterwave: data }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } })
  }
})
