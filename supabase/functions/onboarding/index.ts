import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

const genKey = (prefix: string) => {
  const rand = crypto.getRandomValues(new Uint8Array(24))
  const base = Array.from(rand).map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${prefix}${base}`
}

const sha256 = async (s: string) => {
  const enc = new TextEncoder().encode(s)
  const dig = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(dig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const merchantId = body.merchant_id as number
    const onboarding = body.onboarding || {}
    if (!merchantId) return new Response(JSON.stringify({ ok: false, error: 'missing_merchant_id' }), { status: 400 })

    await client.from('merchant_onboarding').insert({ merchant_id: merchantId, business_type: onboarding.business_type || null, address: onboarding.address || null, description: onboarding.description || null, industry: onboarding.industry || null, contact_name: onboarding.contact_name || null, contact_phone: onboarding.contact_phone || null })

    const testPub = genKey('pssd_test_pk_')
    const testSec = genKey('pssd_test_sk_')
    const testHash = await sha256(testSec)

    const { error: upErr } = await client.from('merchants').update({ account_status: 'onboarded', test_public_key: testPub, test_secret_hash: testHash }).eq('id', merchantId)
    if (upErr) return new Response(JSON.stringify({ ok: false, error: 'update_failed' }), { status: 400 })

    return new Response(JSON.stringify({ ok: true, test_public_key: testPub, test_secret_key_once: testSec }), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
