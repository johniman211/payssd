import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const client = createClient(url, key)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
  }
  try {
    const body = await req.json()
    const email = (body?.email || '').toString().trim().toLowerCase()
    const password = (body?.password || '').toString()
    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'missing_parameters' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const { data: created, error: createErr } = await client.auth.admin.createUser({ email, password, email_confirm: true })
    if (createErr) {
      return new Response(JSON.stringify({ ok: false, error: 'create_user_failed', details: createErr.message }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const userId = created.user?.id
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: 'no_user_id' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const name = email.split('@')[0]
    const { data: adminRow, error: adminErr } = await client
      .from('admins')
      .upsert({ user_id: userId, email, name, role: 'super_admin', updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select('*')
      .single()
    if (adminErr) {
      return new Response(JSON.stringify({ ok: false, error: 'admin_insert_failed', details: adminErr.message }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const { data: others } = await client.from('admins').select('*').neq('user_id', userId)
    if (others && others.length) {
      for (const a of others) {
        try {
          await client.from('admins').delete().eq('user_id', a.user_id)
          if (a.user_id) await client.auth.admin.deleteUser(a.user_id)
        } catch (_) {}
      }
    }

    return new Response(JSON.stringify({ ok: true, admin: adminRow }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
})

