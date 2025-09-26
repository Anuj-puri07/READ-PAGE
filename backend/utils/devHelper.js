// Development helper for email verification
const User = require('../models/User');

// Auto-verify user for development (bypass email verification)
const autoVerifyUser = async (email) => {
  try {
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_EMAIL_VERIFICATION === 'true') {
      const user = await User.findOne({ where: { email } });
      if (user && !user.isEmailVerified) {
        await user.update({ 
          isEmailVerified: true, 
          emailVerificationToken: null 
        });
        console.log(`✅ Auto-verified user: ${email}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Auto-verify error:', error);
    return false;
  }
};

// Get verification token for manual verification
const getVerificationToken = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (user && user.emailVerificationToken) {
      const base = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
      const verificationUrl = `${base}/verify-email?token=${user.emailVerificationToken}`;
      console.log(`🔗 Manual verification URL for ${email}:`);
      console.log(verificationUrl);
      return verificationUrl;
    }
    return null;
  } catch (error) {
    console.error('Get verification token error:', error);
    return null;
  }
};

module.exports = {
  autoVerifyUser,
  getVerificationToken
};
