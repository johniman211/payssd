import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const email = body.email as string
    const password = body.password as string
    const business = body.business || {}
    if (!email || !password) return new Response(JSON.stringify({ ok: false, error: 'missing_credentials' }), { status: 400 })

    const { data: userData, error: userErr } = await client.auth.admin.createUser({ email, password, email_confirm: true })
    if (userErr || !userData.user) return new Response(JSON.stringify({ ok: false, error: 'create_user_failed' }), { status: 400 })

    const { data: merchant, error: insertErr } = await client.from('merchants').insert({ user_id: userData.user.id, email, account_status: 'new' }).select('*').single()
    if (insertErr) return new Response(JSON.stringify({ ok: false, error: 'create_merchant_failed' }), { status: 400 })

    if (Object.keys(business).length) {
      await client.from('merchant_onboarding').insert({ merchant_id: merchant.id, business_type: business.business_type || null, address: business.address || null, description: business.description || null, industry: business.industry || null, contact_name: business.contact_name || null, contact_phone: business.contact_phone || null })
    }

    return new Response(JSON.stringify({ ok: true, merchant_id: merchant.id, user_id: userData.user.id }), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
