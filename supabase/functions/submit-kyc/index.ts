import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const merchantId = body.merchant_id as number
    const kyc = body.kyc || {}
    if (!merchantId) return new Response(JSON.stringify({ ok: false, error: 'missing_merchant_id' }), { status: 400 })
    const payload = {
      merchant_id: merchantId,
      registration_doc_url: kyc.registration_doc_url || null,
      id_doc_url: kyc.id_doc_url || null,
      address_proof_url: kyc.address_proof_url || null,
      bank_account_name: kyc.bank_account_name || null,
      bank_account_number: kyc.bank_account_number || null,
      bank_code: kyc.bank_code || null,
      status: 'pending'
    }
    const { error } = await client.from('merchant_kyc').insert(payload)
    if (error) return new Response(JSON.stringify({ ok: false, error: 'kyc_insert_failed' }), { status: 400 })
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
