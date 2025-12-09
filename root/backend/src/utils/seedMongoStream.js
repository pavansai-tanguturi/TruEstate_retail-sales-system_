import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { connectDb } from './db.js'
import { Sale } from '../models/Sale.js'

dotenv.config()

const DATA_FILE = process.env.DATA_FILE || './data/truestate_assignment_dataset.csv'
const MONGO_URI = process.env.MONGO_URI
const BATCH_SIZE = 1000 // Process 1000 records at a time

const numberFields = [
  'age',
  'quantity',
  'pricePerUnit',
  'discountPercentage',
  'totalAmount',
  'finalAmount',
]

const coerceNumber = (value) => {
  if (value === undefined || value === null || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const coerceDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeRecord = (raw) => {
  const normalized = { ...raw }

  numberFields.forEach((field) => {
    normalized[field] = coerceNumber(raw[field])
  })

  const dateObj = coerceDate(raw.date)
  normalized.date = dateObj || raw.date
  normalized.dateMs = dateObj ? dateObj.getTime() : null

  normalized.customerName = raw.customerName?.trim() ?? ''
  normalized.phoneNumber = raw.phoneNumber?.trim() ?? ''
  normalized.tags = raw.tags ? raw.tags.split(/[,;]+/).map((tag) => tag.trim()).filter(Boolean) : []
  normalized.gender = raw.gender?.trim()
  normalized.customerRegion = raw.customerRegion?.trim()
  normalized.productCategory = raw.productCategory?.trim()
  normalized.paymentMethod = raw.paymentMethod?.trim()

  return normalized
}

export const seedMongoFromCsv = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is required to seed Mongo')
  await connectDb(MONGO_URI)

  const resolvedPath = path.resolve(DATA_FILE)
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Data file not found at ${resolvedPath}`)
  }

  console.log(`Starting to seed MongoDB from ${DATA_FILE}`)
  console.log('Clearing existing data...')
  await Sale.deleteMany({})

  return new Promise((resolve, reject) => {
    let batch = []
    let totalProcessed = 0
    let batchNumber = 0

    const processBatch = async () => {
      if (batch.length === 0) return

      try {
        const normalizedBatch = batch.map(normalizeRecord)
        await Sale.insertMany(normalizedBatch, { ordered: false })
        
        batchNumber++
        totalProcessed += batch.length
        console.log(`✅ Processed batch ${batchNumber}: ${batch.length} records (Total: ${totalProcessed})`)
        
        batch = []
      } catch (error) {
        console.error(`❌ Error processing batch ${batchNumber}:`, error.message)
        // Continue with next batch even if current fails
        batch = []
      }
    }

    const fileStream = fs.createReadStream(resolvedPath, { encoding: 'utf8' })
    
    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: async (results) => {
        if (results.errors.length > 0) {
          console.warn('Parse errors:', results.errors)
          return
        }

        batch.push(results.data)

        if (batch.length >= BATCH_SIZE) {
          await processBatch()
        }
      },
      complete: async () => {
        try {
          // Process remaining records
          if (batch.length > 0) {
            await processBatch()
          }
          
          console.log(`🎉 Seeding completed! Total records processed: ${totalProcessed}`)
          resolve(totalProcessed)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        reject(error)
      }
    })
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedMongoFromCsv()
    .then((count) => {
      console.log(`Seeding completed with ${count} records`)
      mongoose.connection.close()
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      mongoose.connection.close()
    })
}