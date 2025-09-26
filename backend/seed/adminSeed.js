const bcrypt = require('bcrypt')
const User = require('../models/User')

async function seedAdmin() {
  try {
    const desiredEmail = process.env.ADMIN_EMAIL || 'alishban93@gmail.com'
    const desiredPassword = process.env.ADMIN_PASSWORD || '11111111'
    const desiredName = process.env.ADMIN_NAME || 'Alish'

    // Look for any admin
    let admin = await User.findOne({ where: { role: 'admin' } })
    const passwordHash = await bcrypt.hash(desiredPassword, 10)

    if (!admin) {
      admin = await User.create({ name: desiredName, email: desiredEmail, passwordHash, role: 'admin' })
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
    // Always set to desired password so you can log in after env changes
    updates.passwordHash = passwordHash

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


