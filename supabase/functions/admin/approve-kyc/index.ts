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
    const approve = body.approve === true
    const reviewer = body.reviewer_admin_id as number | null
    if (!merchantId) return new Response(JSON.stringify({ ok: false, error: 'missing_merchant_id' }), { status: 400 })

    if (!approve) {
      await client.from('merchant_kyc').update({ status: 'rejected', reviewed_by_admin_id: reviewer, reviewed_at: new Date().toISOString() }).eq('merchant_id', merchantId)
      await client.from('merchants').update({ account_status: 'rejected' }).eq('id', merchantId)
      return new Response(JSON.stringify({ ok: true, approved: false }), { headers: { 'Content-Type': 'application/json' } })
    }

    const livePub = genKey('pssd_live_pk_')
    const liveSec = genKey('pssd_live_sk_')
    const liveHash = await sha256(liveSec)

    await client.from('merchant_kyc').update({ status: 'approved', reviewed_by_admin_id: reviewer, reviewed_at: new Date().toISOString() }).eq('merchant_id', merchantId)
    await client.from('merchants').update({ account_status: 'verified', live_public_key: livePub, live_secret_hash: liveHash }).eq('id', merchantId)

    return new Response(JSON.stringify({ ok: true, approved: true, live_public_key: livePub, live_secret_key_once: liveSec }), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
