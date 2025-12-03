import { supabase } from '@/supabase/supabaseClient'

const templates = {
  merchant_signup: ({ merchant_name }) => ({
    title: 'New Merchant Signup',
    message: `Welcome ${merchant_name}. Your account has been created.`,
    type: 'system'
  }),
  payment_link_created: ({ title, amount }) => ({
    title: 'Payment Link Created',
    message: `Link "${title}" created for SSP ${amount}.`,
    type: 'system'
  }),
  transaction_succeeded: ({ amount, reference }) => ({
    title: 'Payment Received',
    message: `Payment SSP ${amount} received. Ref ${reference}.`,
    type: 'payment'
  }),
  transaction_failed: ({ amount, reference, reason }) => ({
    title: 'Payment Failed',
    message: `Payment SSP ${amount} failed. Ref ${reference}. ${reason || ''}`,
    type: 'payment'
  }),
  payout_requested: ({ amount }) => ({
    title: 'Payout Requested',
    message: `Payout request for SSP ${amount}.`,
    type: 'payout'
  }),
  system_alert: ({ message }) => ({
    title: 'System Alert',
    message,
    type: 'system'
  })
}

export const publishNotification = async (event, payload) => {
  // Try edge function first
  try {
    const { data, error } = await supabase.functions.invoke('notify', {
      body: { event, ...payload }
    })
    if (!error) return data
  } catch {}

  // Fallback: direct inserts (no email)
  try {
    const t = templates[event]
    if (!t) return null
    const built = t(payload?.payload || {})

    const rows = []
    if (payload?.merchant_id) {
      rows.push({
        merchant_id: payload.merchant_id,
        type: built.type,
        title: built.title,
        message: built.message,
        recipient_type: 'merchant'
      })
    }
    rows.push({
      merchant_id: payload?.merchant_id || null,
      type: built.type,
      title: built.title,
      message: built.message,
      recipient_type: 'admin'
    })

    if (rows.length) {
      await supabase.from('notifications').insert(rows)
    }
  } catch {}

  return null
}

export default { publishNotification }
