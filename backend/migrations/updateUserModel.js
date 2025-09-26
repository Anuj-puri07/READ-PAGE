const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

async function updateUserModel() {
  try {
    console.log('Starting user model migration...')
    
    // Check if the new columns exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME IN ('username', 'phoneNumber', 'address', 'profilePhoto', 'isEmailVerified', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires')
    `)
    
    const existingColumns = results.map(row => row.COLUMN_NAME)
    console.log('Existing columns:', existingColumns)
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'username', type: 'VARCHAR(50)', nullable: false, unique: true },
      { name: 'phoneNumber', type: 'VARCHAR(20)', nullable: false, unique: true },
      { name: 'address', type: 'TEXT', nullable: true },
      { name: 'profilePhoto', type: 'VARCHAR(500)', nullable: true },
      { name: 'isEmailVerified', type: 'TINYINT(1)', nullable: false, default: false },
      { name: 'emailVerificationToken', type: 'VARCHAR(255)', nullable: true },
      { name: 'passwordResetToken', type: 'VARCHAR(255)', nullable: true },
      { name: 'passwordResetExpires', type: 'DATETIME', nullable: true }
    ]
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`)
        let sql = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`
        if (!column.nullable) {
          sql += ' NOT NULL'
        }
        if (column.default !== undefined) {
          sql += ` DEFAULT ${column.default}`
        }
        if (column.unique) {
          sql += ' UNIQUE'
        }
        
        await sequelize.query(sql)
        console.log(`Added column: ${column.name}`)
      } else {
        console.log(`Column ${column.name} already exists`)
      }
    }
    
    // Update existing users with default values
    console.log('Updating existing users with default values...')
    
    // Get all users that need updating
    const [users] = await sequelize.query(`
      SELECT id, email, name FROM users 
      WHERE username IS NULL OR phoneNumber IS NULL
    `)
    
    for (const user of users) {
      const username = `user_${user.id}_${Date.now()}`
      const phoneNumber = `+977-${user.id.toString().padStart(10, '0')}`
      
      await sequelize.query(`
        UPDATE users 
        SET username = ?, 
            phoneNumber = ?, 
            isEmailVerified = true 
        WHERE id = ?
      `, {
        replacements: [username, phoneNumber, user.id]
      })
      
      console.log(`Updated user ${user.id} with username: ${username}`)
    }
    
    // Add unique constraints if they don't exist
    try {
      await sequelize.query('ALTER TABLE users ADD UNIQUE INDEX users_username_unique (username)')
      console.log('Added username unique constraint')
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) {
        console.log('Username unique constraint already exists or error:', err.message)
      }
    }
    
    try {
      await sequelize.query('ALTER TABLE users ADD UNIQUE INDEX users_phone_unique (phoneNumber)')
      console.log('Added phone number unique constraint')
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) {
        console.log('Phone number unique constraint already exists or error:', err.message)
      }
    }
    
    console.log('User model migration completed successfully!')
    
  } catch (err) {
    console.error('Migration failed:', err)
    throw err
  }
}

module.exports = updateUserModel
