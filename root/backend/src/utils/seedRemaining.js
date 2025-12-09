import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { connectDb } from './db.js'
import { Sale } from '../models/Sale.js'

dotenv.config()

const DATA_FILE = process.env.DATA_FILE || './data/truestate_assignment_dataset.csv'
const MONGO_URI = process.env.MONGO_URI
const BATCH_SIZE = 250
const MAX_RECORDS = 500000 // Maximum records to import

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

const parseCsvLine = (line) => {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current.trim())
  return values
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

export const seedRemainingRecords = async () => {
  if (!MONGO_URI) throw new Error('MONGO_URI is required to seed Mongo')
  await connectDb(MONGO_URI)

  const resolvedPath = path.resolve(DATA_FILE)
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Data file not found at ${resolvedPath}`)
  }

  console.log(`🚀 Seeding records up to ${MAX_RECORDS.toLocaleString()}`)
  console.log(`📝 Will import records from the beginning`)

  const fileStream = fs.createReadStream(resolvedPath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let headers = []
  let batch = []
  let totalProcessed = 0
  let batchNumber = 0
  let lineNumber = 0
  let isFirstLine = true
  let startTime = Date.now()

  const processBatch = async () => {
    if (batch.length === 0) return

    try {
      const normalizedBatch = batch.map(normalizeRecord)
      await Sale.insertMany(normalizedBatch, { ordered: false })
      
      batchNumber++
      totalProcessed += batch.length
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      const rate = (totalProcessed / elapsed).toFixed(0)
      
      if (batchNumber % 5 === 0) {
        console.log(`✅ Batch ${batchNumber}: ${totalProcessed.toLocaleString()} new records (${rate} rec/s)`)
      }
      
      batch = []
      
      if (global.gc) {
        global.gc()
      }
    } catch (error) {
      console.error(`❌ Error processing batch ${batchNumber}:`, error.message)
      batch = []
    }
  }

  console.log('📖 Reading CSV file...')

  for await (const line of rl) {
    lineNumber++
    
    if (isFirstLine) {
      headers = parseCsvLine(line)
      isFirstLine = false
      continue
    }

    // Stop if we've reached the maximum
    if (totalProcessed >= MAX_RECORDS) {
      console.log(`🛑 Reached maximum limit of ${MAX_RECORDS.toLocaleString()} records`)
      break
    }

    if (line.trim() === '') continue

    try {
      const values = parseCsvLine(line)
      const record = {}
      
      headers.forEach((header, index) => {
        const cleanHeader = header.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        const fieldMap = {
          'transactionid': 'transactionId',
          'date': 'date',
          'customerid': 'customerId',
          'customername': 'customerName',
          'phonenumber': 'phoneNumber',
          'gender': 'gender',
          'age': 'age',
          'customerregion': 'customerRegion',
          'customertype': 'customerType',
          'productid': 'productId',
          'productname': 'productName',
          'brand': 'brand',
          'productcategory': 'productCategory',
          'tags': 'tags',
          'quantity': 'quantity',
          'priceperunit': 'pricePerUnit',
          'discountpercentage': 'discountPercentage',
          'totalamount': 'totalAmount',
          'finalamount': 'finalAmount',
          'paymentmethod': 'paymentMethod',
          'orderstatus': 'orderStatus',
          'deliverytype': 'deliveryType',
          'storeid': 'storeId',
          'storelocation': 'storeLocation',
          'salespersonid': 'salespersonId',
          'employeename': 'employeeName'
        }
        
        const fieldName = fieldMap[cleanHeader] || cleanHeader
        record[fieldName] = values[index] || ''
      })

      batch.push(record)

      if (batch.length >= BATCH_SIZE) {
        await processBatch()
      }
    } catch (error) {
      console.warn(`⚠️  Skipping line ${lineNumber}: ${error.message}`)
    }
  }

  // Process remaining records
  if (batch.length > 0) {
    await processBatch()
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  const avgRate = totalProcessed > 0 ? (totalProcessed / totalTime).toFixed(0) : 0

  console.log(`\n🎉 Seeding completed!`)
  console.log(`📊 Records added: ${totalProcessed.toLocaleString()}`)
  console.log(`⏱️  Time taken: ${totalTime}s`)
  console.log(`📈 Average rate: ${avgRate} records/second`)
  
  return totalProcessed
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRemainingRecords()
    .then((count) => {
      console.log(`✅ Successfully seeded ${count.toLocaleString()} additional records`)
      mongoose.connection.close()
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error.message)
      mongoose.connection.close()
      process.exit(1)
    })
}
