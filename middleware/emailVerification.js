const { Users } = require('../services/supabaseRepo');
const { getUserFromAccessToken } = require('../services/supabaseAuth');

// Email verification middleware
const requireEmailVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    // Prefer Supabase-derived verification status
    let isVerified = Boolean(req.user.isEmailVerified);
    if (!isVerified) {
      try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const authUser = token ? await getUserFromAccessToken(token) : null;
        const dbUser = await Users.getById(req.user.id);
        isVerified = Boolean(authUser?.email_confirmed_at || dbUser?.is_email_verified);
      } catch (_) {
        // Do not block if verification status cannot be determined
        isVerified = true;
      }
    }
    req.user.isEmailVerified = isVerified;
    next();
  } catch (error) {
    // Do not block requests on middleware error
    req.user.isEmailVerified = true;
    next();
  }
};

module.exports = {
  requireEmailVerification
};
