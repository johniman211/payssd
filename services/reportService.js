const nodemailer = require('nodemailer')

const createEmailTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587)
  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS
  if (!(host && user && pass)) return null
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
}

const transporter = createEmailTransporter()

const sendTransactionReportEmail = async (merchant, period, summary) => {
  try {
    if (!transporter) return { success: false, message: 'Email not configured' }
    const title = period === 'weekly' ? 'Weekly Transaction Summary' : 'Monthly Transaction Summary'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #111827; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">${title}</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="color:#374151;">Hello ${merchant.profile.firstName}, here is your ${period} report.</p>
          <ul style="color:#111827; line-height:1.8;">
            <li><strong>Total Received:</strong> USD ${summary.total.toLocaleString()}</li>
            <li><strong>Payments Count:</strong> ${summary.count}</li>
            <li><strong>Total Fees:</strong> USD ${summary.fees.toLocaleString()}</li>
          </ul>
          <p style="color:#6b7280;">Period: ${new Date(summary.from).toLocaleDateString()} – ${new Date(summary.to).toLocaleDateString()}</p>
          <div style="text-align:center; margin-top:20px;">
            <a href="${process.env.CLIENT_URL}/dashboard/transactions" style="background:#2563eb; color:white; padding:10px 16px; border-radius:6px; text-decoration:none;">View Transactions</a>
          </div>
        </div>
      </div>
    `
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: merchant.email,
      subject: `${title} | PaySSD`,
      html
    })
    return { success: true }
  } catch (e) {
    console.error('Report email error:', e.message)
    return { success: false, error: e.message }
  }
}

module.exports = { sendTransactionReportEmail }
