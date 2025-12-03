import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const merchantId = body.merchant_id as number
    const filename = body.filename as string
    if (!merchantId || !filename) return new Response(JSON.stringify({ ok: false, error: 'missing_parameters' }), { status: 400 })
    const path = `${merchantId}/${Date.now()}_${filename}`
    const { data, error } = await client.storage.from('merchant-kyc').createSignedUploadUrl(path)
    if (error) return new Response(JSON.stringify({ ok: false, error: 'signed_url_failed' }), { status: 400 })
    return new Response(JSON.stringify({ ok: true, path, url: data.signedUrl }), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
