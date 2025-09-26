const sequelize = require('./config/db')

async function resetDatabase() {
  try {
    console.log('Dropping all tables...')
    await sequelize.drop()
    console.log('All tables dropped successfully')
    
    console.log('Recreating all tables...')
    await sequelize.sync({ force: true })
    console.log('All tables recreated successfully')
    
    console.log('Database reset completed!')
    process.exit(0)
  } catch (err) {
    console.error('Database reset failed:', err)
    process.exit(1)
  }
}

resetDatabase()
