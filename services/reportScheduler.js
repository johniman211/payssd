const User = require('../models/User')
const Transaction = require('../models/Transaction')
const { sendTransactionReportEmail } = require('./reportService')

const startReportScheduler = () => {
  // Run once a day
  setInterval(async () => {
    try {
      const now = new Date()
      const day = now.getUTCDay() // 1 = Monday
      const date = now.getUTCDate() // 1st of month

      const users = await User.find({ 'settings.notifications': { $exists: true } })
        .select('email profile settings')

      for (const u of users) {
        const notif = u.settings.notifications || {}
        const merchantId = u._id

        // Weekly on Monday
        if (day === 1 && notif.weeklyReports && notif.emailNotifications) {
          const from = new Date(now)
          from.setUTCDate(now.getUTCDate() - 7)
          const txs = await Transaction.find({ merchant: merchantId, status: 'successful', createdAt: { $gte: from, $lte: now } })
            .select('amount fees')
          const total = txs.reduce((s, t) => s + (t.amount || 0), 0)
          const count = txs.length
          const fees = txs.reduce((s, t) => s + (t.fees?.totalFees || 0), 0)
          await sendTransactionReportEmail(u, 'weekly', { total, count, fees, from, to: now })
        }

        // Monthly on the 1st
        if (date === 1 && notif.monthlyReports && notif.emailNotifications) {
          const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
          const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59))
          const txs = await Transaction.find({ merchant: merchantId, status: 'successful', createdAt: { $gte: from, $lte: to } })
            .select('amount fees')
          const total = txs.reduce((s, t) => s + (t.amount || 0), 0)
          const count = txs.length
          const fees = txs.reduce((s, t) => s + (t.fees?.totalFees || 0), 0)
          await sendTransactionReportEmail(u, 'monthly', { total, count, fees, from, to })
        }
      }
    } catch (e) {
      console.error('Report scheduler error:', e.message)
    }
  }, 24 * 60 * 60 * 1000)
}

module.exports = { startReportScheduler }
