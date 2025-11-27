const { Users, supabase } = require('./supabaseRepo')
const supaAuth = require('./supabaseAuth')

const bootstrapAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    if (!email || !password) return

    // Ensure Supabase is configured
    if (!supabase) return

    // Check if admin exists
    let existing = null
    try {
      existing = await Users.findByEmail(email)
    } catch (_) {}

    if (!existing) {
      const authUser = await supaAuth.createUser(email, password)
      try { await supaAuth.confirmEmail(authUser.id) } catch (_) {}
      await Users.create({ id: authUser.id, email, role: 'admin', profile: {}, settings: {}, emailVerificationToken: null })
      console.log('Bootstrap: Admin user created in Supabase')
    } else {
      // Ensure role is admin
      if (existing.role !== 'admin') {
        await supabase.from('users').update({ role: 'admin' }).eq('id', existing.id)
        console.log('Bootstrap: Updated existing user to admin role')
      }
    }
  } catch (e) {
    console.log('Bootstrap admin error:', e?.message || e)
  }
}

module.exports = { bootstrapAdmin }
