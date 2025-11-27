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
  ,
  async list(user_id, { status, paymentMethod, currency, startDate, endDate, minAmount, maxAmount, search, page = 1, limit = 20 }) {
    ensure()
    let q = supabase
      .from('transactions')
      .select('transaction_id,reference,amount,currency,status,payment_method,customer,description,fees,created_at,completed_at', { count: 'exact' })
      .eq('user_id', user_id)
    if (status) q = q.eq('status', status)
    if (paymentMethod) q = q.eq('payment_method', paymentMethod)
    if (currency) q = q.eq('currency', currency)
    if (startDate) q = q.gte('created_at', new Date(startDate).toISOString())
    if (endDate) q = q.lte('created_at', new Date(endDate).toISOString())
    if (minAmount) q = q.gte('amount', parseFloat(minAmount))
    if (maxAmount) q = q.lte('amount', parseFloat(maxAmount))
    if (search) {
      q = q.or(`transaction_id.ilike.%${search}%,description.ilike.%${search}%`) // customer name search can be added via computed index
    }
    q = q.order('created_at', { ascending: false }).range((page - 1) * limit, (page - 1) * limit + (limit - 1))
    const { data, error, count } = await q
    if (error) throw error
    return { data: data || [], totalCount: count || 0 }
  },
  async getByTransactionId(user_id, transaction_id) {
    ensure()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .eq('transaction_id', transaction_id)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
  async statsOverview(user_id) {
    ensure()
    const { data: all } = await supabase
      .from('transactions')
      .select('amount,fees,status,payment_method,currency,created_at')
      .eq('user_id', user_id)
    const successful = (all || []).filter(t => t.status === 'successful')
    const totalTransactions = (all || []).length
    const successfulTransactions = successful.length
    const totalAmount = (all || []).reduce((s, t) => s + (t.amount || 0), 0)
    const totalFees = (all || []).reduce((s, t) => s + ((t.fees?.totalFees || t.fees?.total || 0)), 0)
    const averageTransaction = totalTransactions ? Math.round(totalAmount / totalTransactions) : 0
    const successRate = totalTransactions ? Math.round((successfulTransactions / totalTransactions) * 100) : 0
    return { totalTransactions, successfulTransactions, totalAmount, totalFees, averageTransaction, successRate }
  }
}

const Payouts = {
  calculateProcessingFee(amount, method) {
    const table = {
      bank_transfer: { fixed: 2, percentage: 0.015 },
      mobile_money: { fixed: 1, percentage: 0.01 },
      cash_pickup: { fixed: 5, percentage: 0.02 }
    }
    const feeCfg = table[method] || table.bank_transfer
    return Math.round((amount * feeCfg.percentage) + feeCfg.fixed)
  },
  async list(user_id, { status, currency, method, startDate, endDate, page = 1, limit = 20 }) {
    ensure()
    let q = supabase.from('payouts').select('id,payout_id,amount,currency,method,status,created_at,completed_at').eq('user_id', user_id)
    if (status) q = q.eq('status', status)
    if (currency) q = q.eq('currency', currency)
    if (method) q = q.eq('method', method)
    if (startDate) q = q.gte('created_at', new Date(startDate).toISOString())
    if (endDate) q = q.lte('created_at', new Date(endDate).toISOString())
    q = q.order('created_at', { ascending: false }).range((page - 1) * limit, (page - 1) * limit + (limit - 1))
    const { data, error, count } = await q
    if (error) throw error
    // Supabase count requires head:true, but we can fetch total separately
    const { count: totalCount } = await supabase
      .from('payouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
    return { data: data || [], totalCount: totalCount || 0 }
  },
  async getByPayoutId(user_id, payout_id) {
    ensure()
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', user_id)
      .eq('payout_id', payout_id)
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },
  async countPending(user_id) {
    ensure()
    const { count } = await supabase
      .from('payouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .in('status', ['pending','processing'])
    return count || 0
  },
  async create({ user_id, amount, currency, method, destination, notes }) {
    ensure()
    const processingFee = Payouts.calculateProcessingFee(amount, method)
    const insert = {
      user_id,
      amount,
      currency,
      method,
      destination,
      fees: { processingFee },
      notes,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('payouts')
      .insert(insert)
      .select('id,payout_id,amount,currency,method,fees,status,created_at')
      .maybeSingle()
    if (error) throw error
    return data
  },
  async cancel(user_id, payout_id) {
    ensure()
    const { data, error } = await supabase
      .from('payouts')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: 'Cancelled by merchant' })
      .eq('user_id', user_id)
      .eq('payout_id', payout_id)
      .select('*')
      .maybeSingle()
    if (error) throw error
    return data
  },
  async statsOverview(user_id) {
    ensure()
    const { data: all } = await supabase
      .from('payouts')
      .select('amount,fees,status,method,currency,created_at')
      .eq('user_id', user_id)
    const completed = (all || []).filter(p => p.status === 'completed')
    const totalPayouts = (all || []).length
    const completedPayouts = completed.length
    const totalAmount = (all || []).reduce((s, p) => s + (p.amount || 0), 0)
    const totalFees = (all || []).reduce((s, p) => s + ((p.fees?.processingFee) || 0), 0)
    const averagePayout = totalPayouts ? Math.round(totalAmount / totalPayouts) : 0
    const successRate = totalPayouts ? Math.round((completedPayouts / totalPayouts) * 100) : 0
    const recent = (all || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5)
    return { totalPayouts, completedPayouts, totalAmount, totalFees, averagePayout, successRate, recent }
  }
}

module.exports = { supabase, Users, PaymentLinks, Transactions, Payouts, calculatePlatformFee }
