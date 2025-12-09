import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { loadSalesData } from './dataLoader.js'
import { connectDb } from './db.js'
import { Sale } from '../models/Sale.js'

dotenv.config()

const DATA_FILE = process.env.DATA_FILE || './data/sample_sales.csv'
const MONGO_URI = process.env.MONGO_URI

export const seedMongoFromCsv = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is required to seed Mongo')
  await connectDb(MONGO_URI)

  const records = loadSalesData(DATA_FILE)

  await Sale.deleteMany({})
  await Sale.insertMany(records)

  const count = await Sale.countDocuments()
  await mongoose.connection.close()
  return count
}

if (process.argv[1] && process.argv[1].includes('seedMongo.js')) {
  seedMongoFromCsv()
    .then((count) => {
      console.log(`Seeded ${count} records into MongoDB from ${DATA_FILE}`)
      process.exit(0)
    })
    .catch((err) => {
      console.error('Seeding failed:', err.message)
      process.exit(1)
    })
}
