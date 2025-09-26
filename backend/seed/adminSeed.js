const bcrypt = require('bcrypt')
const User = require('../models/User')

async function seedAdmin() {
  try {
    const desiredEmail = process.env.ADMIN_EMAIL || 'anuzpuri944@gmail.com'
    const desiredPassword = process.env.ADMIN_PASSWORD || '11111111'
    const desiredName = process.env.ADMIN_NAME || 'Anuj'
    const desiredUsername = process.env.ADMIN_USERNAME || 'admin'
    const desiredPhoneNumber = process.env.ADMIN_PHONE || '+977-9810537714'

    // Look for any admin
    let admin = await User.findOne({ where: { role: 'admin' } })
    const passwordHash = await bcrypt.hash(desiredPassword, 10)

    if (!admin) {
      admin = await User.create({ 
        name: desiredName, 
        username: desiredUsername,
        email: desiredEmail, 
        phoneNumber: desiredPhoneNumber,
        passwordHash, 
        role: 'admin',
        isEmailVerified: true // Admin doesn't need email verification
      })
      console.log('Seeded default admin:', desiredEmail)
      return admin
    }

    const updates = {}
    if (admin.email !== desiredEmail) {
      // avoid unique email collision
      const emailOwner = await User.findOne({ where: { email: desiredEmail } })
      if (!emailOwner || emailOwner.id === admin.id) {
        updates.email = desiredEmail
      }
    }
    if (admin.name !== desiredName) updates.name = desiredName
    if (admin.username !== desiredUsername) updates.username = desiredUsername
    if (admin.phoneNumber !== desiredPhoneNumber) updates.phoneNumber = desiredPhoneNumber
    // Always set to desired password so you can log in after env changes
    updates.passwordHash = passwordHash
    // Ensure admin is email verified
    updates.isEmailVerified = true

    if (Object.keys(updates).length) {
      await admin.update(updates)
      console.log('Updated existing admin to match env config:', desiredEmail)
    }
    return admin
  } catch (err) {
    console.error('Admin seed failed:', err)
  }
}

module.exports = seedAdmin


