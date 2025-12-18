require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')

const basePort = parseInt(process.env.PORT || '5000', 10)

connectDB()
  .then(() => {
    console.log('Connected to database')
    const tryListen = (p) => {
      const server = app.listen(p, () => {
        console.log('Server listening on port ' + p)
      })
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          const next = p + 1
          console.error(`Port ${p} in use, trying ${next}`)
          tryListen(next)
        } else {
          console.error('Failed to start server:', err.message)
          process.exit(1)
        }
      })
    }
    tryListen(basePort)
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  })