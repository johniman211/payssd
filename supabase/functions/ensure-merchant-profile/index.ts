import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors() })
  try {
    const body = await req.json()
    const userId = (body?.user_id || '').toString()
    const email = (body?.email || '').toString().toLowerCase().trim()
    const accountType = (body?.account_type || 'personal') as 'personal' | 'business'
    if (!userId || !email) return new Response(JSON.stringify({ ok: false, error: 'missing_parameters' }), { status: 400, headers: cors() })

    const { data: existingByUser } = await client.from('merchants').select('*').eq('user_id', userId).maybeSingle()
    if (existingByUser) return new Response(JSON.stringify({ ok: true, created: false, merchant_id: existingByUser.id }), { headers: cors() })

    const { data: existingByEmail } = await client.from('merchants').select('*').eq('email', email).maybeSingle()
    if (existingByEmail) {
      await client.from('merchants').update({ user_id: userId }).eq('id', existingByEmail.id)
      return new Response(JSON.stringify({ ok: true, created: false, merchant_id: existingByEmail.id }), { headers: cors() })
    }

    const insertPayload: Record<string, any> = {
      user_id: userId,
      email,
      account_type: accountType,
      verification_status: 'pending',
      documents: []
    }
    const { data: inserted, error: insErr } = await client.from('merchants').insert(insertPayload).select('id').single()
    if (insErr) return new Response(JSON.stringify({ ok: false, error: 'insert_failed', details: insErr.message }), { status: 400, headers: cors() })
    return new Response(JSON.stringify({ ok: true, created: true, merchant_id: inserted.id }), { headers: cors() })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request', details: (e as Error)?.message }), { status: 400, headers: cors() })
  }
})

