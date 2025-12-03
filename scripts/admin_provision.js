// Usage: node scripts/admin_provision.js <url> <service_role_key> <email> <password>
import { createClient } from '@supabase/supabase-js'

const [,, url, key, emailArg, passwordArg] = process.argv
if (!url || !key || !emailArg || !passwordArg) {
  console.error('Missing arguments. Usage: node scripts/admin_provision.js <url> <service_role_key> <email> <password>')
  process.exit(1)
}

const client = createClient(url, key)

async function main() {
  const email = emailArg.toLowerCase()
  const password = passwordArg
  let userId = null
  const { data: created, error: createErr } = await client.auth.admin.createUser({ email, password, email_confirm: true })
  if (createErr) {
    console.warn('Create user failed:', createErr.message)
    // Try to find existing user by listing
    const { data: list } = await client.auth.admin.listUsers()
    const found = list?.users?.find?.((u) => u?.email?.toLowerCase() === email)
    if (!found) {
      console.error('Existing user not found by email')
      process.exit(1)
    }
    userId = found.id
  } else {
    userId = created.user?.id
  }
  if (!userId) {
    console.error('No user id returned')
    process.exit(1)
  }
  // Ensure password is set/updated for this admin user
  const { error: updErr } = await client.auth.admin.updateUserById(userId, { password, email_confirm: true })
  if (updErr) {
    console.error('Password update failed:', updErr.message)
    process.exit(1)
  }
  const name = email.split('@')[0]
  const { data: adminRow, error: adminErr } = await client
    .from('admins')
    .upsert({ user_id: userId, email, name, role: 'super_admin', updated_at: new Date().toISOString() }, { onConflict: 'email' })
    .select('*')
    .single()
  if (adminErr) {
    console.error('Admin insert failed:', adminErr.message)
    process.exit(1)
  }
  const { data: others } = await client.from('admins').select('*').neq('user_id', userId)
  if (others && others.length) {
    for (const a of others) {
      try {
        await client.from('admins').delete().eq('user_id', a.user_id)
        if (a.user_id) await client.auth.admin.deleteUser(a.user_id)
      } catch (e) {
        console.warn('Failed to remove other admin', a.user_id, e?.message)
      }
    }
  }
  console.log('Provisioned admin:', { email, user_id: userId })
}

main()
