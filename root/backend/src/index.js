import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import salesRoutes from './routes/salesRoutes.js'
import { initSalesStore } from './services/salesService.js'

dotenv.config()

const PORT = process.env.PORT || 4000
const DATA_FILE = process.env.DATA_FILE || './data/sample_sales.csv'
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

const app = express()
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', salesRoutes)

try {
  const count = initSalesStore(DATA_FILE)
  console.log(`Loaded ${count} sales records from ${DATA_FILE}`)
} catch (error) {
  console.error('Failed to load data file', error.message)
  process.exit(1)
}

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
