import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const url = Deno.env.get('SUPABASE_URL') || ''
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const resendKey = Deno.env.get('RESEND_API_KEY') || ''
const fromEmail = Deno.env.get('NOTIFY_FROM_EMAIL') || 'notifications@payssd.com'

const client = createClient(url, key)

const sendEmail = async (to: string[], subject: string, html: string) => {
  if (!resendKey || to.length === 0) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: fromEmail, to, subject, html })
  })
}

const merchantRecipients = async (merchantId: number) => {
  const { data } = await client.from('merchants').select('email').eq('id', merchantId).single()
  return data?.email ? [data.email] : []
}

const adminRecipients = async () => {
  const { data } = await client.from('admins').select('email')
  return (data || []).map((a: any) => a.email).filter(Boolean)
}

const insertNotification = async (values: any) => {
  await client.from('notifications').insert(values)
}

const templates = {
  merchant_signup: ({ merchant_name }: any) => ({
    title: 'New Merchant Signup',
    message: `Welcome ${merchant_name}. Your account has been created.`
  }),
  payment_link_created: ({ title, amount }: any) => ({
    title: 'Payment Link Created',
    message: `Link "${title}" created for SSP ${amount}.`
  }),
  transaction_succeeded: ({ amount, reference }: any) => ({
    title: 'Payment Received',
    message: `Payment SSP ${amount} received. Ref ${reference}.`
  }),
  transaction_failed: ({ amount, reference, reason }: any) => ({
    title: 'Payment Failed',
    message: `Payment SSP ${amount} failed. Ref ${reference}. ${reason || ''}`
  }),
  payout_requested: ({ amount }: any) => ({
    title: 'Payout Requested',
    message: `Payout request for SSP ${amount}.`
  }),
  system_alert: ({ message }: any) => ({
    title: 'System Alert',
    message
  })
}

const emailSubjects = {
  merchant_signup: 'New Merchant Signup',
  payment_link_created: 'Payment Link Created',
  transaction_succeeded: 'Payment Received',
  transaction_failed: 'Payment Failed',
  payout_requested: 'Payout Requested',
  system_alert: 'System Alert'
}

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const event: keyof typeof templates = body.event
    const merchantId = body.merchant_id as number | null
    const adminOnly = body.admin_only === true
    const t = templates[event]
    if (!t) return new Response(JSON.stringify({ ok: false, error: 'unknown_event' }), { status: 400 })
    const built = t(body.payload || {})

    if (!adminOnly && merchantId) {
      await insertNotification({ merchant_id: merchantId, type: 'system', title: built.title, message: built.message, recipient_type: 'merchant' })
      const mTo = await merchantRecipients(merchantId)
      await sendEmail(mTo, emailSubjects[event], built.message)
    }

    const aTo = await adminRecipients()
    await insertNotification({ merchant_id: merchantId || null, type: 'system', title: built.title, message: built.message, recipient_type: 'admin' })
    await sendEmail(aTo, `[Admin] ${emailSubjects[event]}`, built.message)

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_request' }), { status: 400 })
  }
})
