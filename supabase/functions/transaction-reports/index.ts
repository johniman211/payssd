import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const url = Deno.env.get('SUPABASE_URL')!
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const sendgridKey = Deno.env.get('SENDGRID_API_KEY')
const sendgridSender = Deno.env.get('SENDGRID_SENDER')

const supabase = createClient(url, key)

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!sendgridKey || !sendgridSender) return
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendgridKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: sendgridSender },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  })
}

serve(async (req) => {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'weekly'
  const now = new Date()
  let from: Date, to: Date
  if (period === 'monthly') {
    from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59))
  } else {
    to = now
    from = new Date(now)
    from.setUTCDate(now.getUTCDate() - 7)
  }

  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('user_id,email_enabled,weekly_reports_email,monthly_reports_email')

  for (const p of prefs || []) {
    const allow = period === 'monthly' ? p.monthly_reports_email : p.weekly_reports_email
    if (!allow || !p.email_enabled) continue
    const { data: userRow } = await supabase
      .from('users')
      .select('id,email,full_name')
      .eq('id', p.user_id)
      .limit(1)
      .maybeSingle()

    const { data: txs } = await supabase
      .from('transactions')
      .select('amount,fees')
      .eq('user_id', p.user_id)
      .eq('status', 'successful')
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())

    const total = (txs || []).reduce((s, t) => s + (t.amount || 0), 0)
    const count = (txs || []).length
    const fees = (txs || []).reduce((s, t) => s + ((t as any).fees?.totalFees || 0), 0)

    await supabase.from('notifications').insert({
      user_id: p.user_id,
      type: 'report',
      title: period === 'monthly' ? 'Monthly Transaction Summary' : 'Weekly Transaction Summary',
      message: `Total USD ${total.toLocaleString()} • Payments ${count} • Fees USD ${fees.toLocaleString()}`,
      read: false
    })

    if (userRow?.email && sendgridKey && sendgridSender) {
      const subject = period === 'monthly' ? 'Monthly Transaction Summary' : 'Weekly Transaction Summary'
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2>${subject}</h2>
          <p>Hello ${userRow.full_name || ''}</p>
          <ul>
            <li>Total Received: USD ${total.toLocaleString()}</li>
            <li>Payments Count: ${count}</li>
            <li>Total Fees: USD ${fees.toLocaleString()}</li>
          </ul>
          <p>Period: ${from.toLocaleDateString()} – ${to.toLocaleDateString()}</p>
        </div>
      `
      await sendEmail(userRow.email, subject, html)
    }
  }

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
})
