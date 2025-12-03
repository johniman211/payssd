import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

Deno.serve(async () => {
  const { data } = await client.from('merchant_kyc').select('*').eq('status','pending')
  return new Response(JSON.stringify({ ok: true, data }), { headers: { 'Content-Type': 'application/json' } })
})
