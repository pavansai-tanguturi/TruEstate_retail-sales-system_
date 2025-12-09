import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

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

export const loadSalesData = (dataFilePath) => {
  const resolvedPath = path.resolve(dataFilePath)
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Data file not found at ${resolvedPath}`)
  }

  const fileContent = fs.readFileSync(resolvedPath, 'utf8')
  const { data, errors } = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (errors.length) {
    const first = errors[0]
    throw new Error(`Failed to parse CSV (row ${first.row}): ${first.message}`)
  }

  return data.map(normalizeRecord)
}
