import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const client = createClient(url, key)

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const email: string | undefined = body.email
    const userId: string | undefined = body.user_id
    let target: any = null

    if (email) {
      const { data, error } = await client.from('merchants').select('*').eq('email', email).single()
      if (error || !data) return new Response(JSON.stringify({ ok: false, error: 'merchant_not_found' }), { status: 404 })
      target = data
    } else if (userId) {
      const { data, error } = await client.from('merchants').select('*').eq('user_id', userId).single()
      if (error || !data) return new Response(JSON.stringify({ ok: false, error: 'merchant_not_found' }), { status: 404 })
      target = data
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'missing_parameters' }), { status: 400 })
    }

    const { data: existing } = await client.from('admins').select('*').eq('user_id', target.user_id).single()
    if (existing) return new Response(JSON.stringify({ ok: true, created: false, admin: existing }))

    const name = `${target.first_name || ''} ${target.last_name || ''}`.trim() || (email || '')
    const { data: created, error: insertError } = await client.from('admins').insert([{ user_id: target.user_id, email: target.email, name, role: 'super_admin' }]).select().single()
    if (insertError) return new Response(JSON.stringify({ ok: false, error: 'insert_failed', details: insertError.message }), { status: 400 })

    return new Response(JSON.stringify({ ok: true, created: true, admin: created }), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
