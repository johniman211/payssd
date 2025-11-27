const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let client = null
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

const ensure = () => {
  if (!client) throw new Error('Supabase auth not configured')
}

const createUser = async (email, password) => {
  ensure()
  const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: false })
  if (error) throw error
  return data.user
}

const signIn = async (email, password) => {
  ensure()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

const confirmEmail = async (userId) => {
  ensure()
  const { error } = await client.auth.admin.updateUserById(userId, { email_confirm: true })
  if (error) throw error
}

module.exports = { createUser, signIn, confirmEmail }
