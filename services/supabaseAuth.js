const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

let adminClient = null
let publicClient = null

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

const ensureAdmin = () => {
  if (!adminClient) throw new Error('Supabase admin not configured')
}
const ensurePublic = () => {
  if (!publicClient) throw new Error('Supabase auth not configured')
}

const createUser = async (email, password) => {
  ensureAdmin()
  const { data, error } = await adminClient.auth.admin.createUser({ email, password, email_confirm: false })
  if (error) throw error
  return data.user
}

const signIn = async (email, password) => {
  ensurePublic()
  const { data, error } = await publicClient.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

const confirmEmail = async (userId) => {
  ensureAdmin()
  const { error } = await adminClient.auth.admin.updateUserById(userId, { email_confirm: true })
  if (error) throw error
}

module.exports = { createUser, signIn, confirmEmail }

// Additional helpers for server-side auth flows
const getUserFromAccessToken = async (accessToken) => {
  ensurePublic()
  const { data, error } = await publicClient.auth.getUser(accessToken)
  if (error) throw error
  return data.user
}

const adminUpdatePassword = async (userId, newPassword) => {
  ensureAdmin()
  const { error } = await adminClient.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) throw error
}

module.exports.getUserFromAccessToken = getUserFromAccessToken
module.exports.adminUpdatePassword = adminUpdatePassword
