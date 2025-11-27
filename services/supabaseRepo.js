const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

const ensure = () => {
  if (!supabase) throw new Error('Supabase not configured')
}

const calculatePlatformFee = (amount) => {
  const percentage = 0.025
  const fixed = 5
  return Math.round((amount * percentage) + fixed)
}

const Users = {
  async findByEmail(email) {
    ensure()
    const { data, error } = await supabase
      .from('users')
      .select('id,email,role,profile,settings,is_active,is_locked,login_attempts,email_verification_token,is_email_verified')
      .eq('email', email)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
  async create({ id, email, role = 'merchant', profile, settings, emailVerificationToken }) {
    ensure()
    const insert = {
      id,
      email,
      role,
      profile: profile || {},
      settings: settings || {},
      is_active: true,
      is_locked: false,
      login_attempts: 0,
      email_verification_token: emailVerificationToken,
      is_email_verified: false,
      created_at: new Date().toISOString()
    }
    const { error } = await supabase.from('users').insert(insert)
    if (error) throw error
  },
  async getById(id) {
    ensure()
    const { data, error } = await supabase
      .from('users')
      .select('id,email,full_name,profile,settings,subscription,apiKeys')
      .eq('id', id)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
  async updateProfile(id, profile) {
    ensure()
    const { error } = await supabase
      .from('users')
      .update({ profile })
      .eq('id', id)
    if (error) throw error
  },
  async updateEmailVerificationByToken(token) {
    ensure()
    const { data, error } = await supabase
      .from('users')
      .update({ is_email_verified: true, email_verification_token: null })
      .eq('email_verification_token', token)
      .select('id,email')
      .maybeSingle()
    if (error) throw error
    return data
  },
  async markLoginMeta(id, ip, userAgent) {
    ensure()
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString(), ip_address: ip, user_agent: userAgent, login_attempts: 0 })
      .eq('id', id)
    if (error) throw error
  },
  async getSettings(id) {
    ensure()
    const { data, error } = await supabase
      .from('users')
      .select('settings,apiKeys')
      .eq('id', id)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data || {}
  },
  async updateSettings(id, settings, apiKeys) {
    ensure()
    const { error } = await supabase
      .from('users')
      .update({ settings, apiKeys })
      .eq('id', id)
    if (error) throw error
  }
}

const PaymentLinks = {
  async getByLinkId(linkId) {
    ensure()
    const { data, error } = await supabase
      .from('payment_links')
      .select('*')
      .eq('link_id', linkId)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
  async recordPayment(id, amount) {
    ensure()
    const { error } = await supabase
      .rpc('record_payment_for_link', { link_id_input: id, amount_input: amount })
    if (error) {
      // fallback update: increment simple counter
      await supabase
        .from('payment_links')
        .update({ last_payment_at: new Date().toISOString() })
        .eq('id', id)
    }
  }
}

const Transactions = {
  async create({ user_id, tx_ref, transaction_id, merchant_id, amount, currency, description, payment_method, customer, payment_link_id }) {
    ensure()
    const platformFee = calculatePlatformFee(amount)
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id: transaction_id || undefined,
        user_id: user_id || merchant_id,
        reference: tx_ref,
        amount,
        currency,
        description,
        status: 'pending',
        payment_method,
        metadata: { customer, payment_link_id },
        fees: { platformFee, providerFee: 0, totalFees: platformFee }
      })
      .select('id')
      .maybeSingle()
    if (error) throw error
    return { id: data?.id, platformFee }
  },
  async updateStatusByRef(tx_ref, status, fields = {}) {
    ensure()
    const { error } = await supabase
      .from('transactions')
      .update({ status, ...fields })
      .eq('reference', tx_ref)
    if (error) throw error
  }
}

module.exports = { supabase, Users, PaymentLinks, Transactions, calculatePlatformFee }
