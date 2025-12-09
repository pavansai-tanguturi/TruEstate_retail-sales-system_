import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import salesRoutes from './routes/salesRoutes.js'
import { connectDb } from './utils/db.js'

dotenv.config()

const PORT = process.env.PORT || 4000
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const MONGO_URI = process.env.MONGO_URI

const app = express()
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', salesRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

const start = async () => {
  try {
    await connectDb(MONGO_URI)
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Startup failed:', err.message)
    process.exit(1)
  }
}

start()
