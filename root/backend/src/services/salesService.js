import { loadSalesData } from '../utils/dataLoader.js'

let salesStore = []
let dataLoaded = false
let filterSnapshot = {
  regions: [],
  genders: [],
  categories: [],
  tags: [],
  paymentMethods: [],
  minAge: null,
  maxAge: null,
  minDate: null,
  maxDate: null,
}

const computeFilters = (records) => {
  const toSet = () => new Set()
  const regions = toSet()
  const genders = toSet()
  const categories = toSet()
  const tags = toSet()
  const paymentMethods = toSet()

  let minAge = null
  let maxAge = null
  let minDate = null
  let maxDate = null

  records.forEach((record) => {
    if (record.customerRegion) regions.add(record.customerRegion)
    if (record.gender) genders.add(record.gender)
    if (record.productCategory) categories.add(record.productCategory)
    if (record.paymentMethod) paymentMethods.add(record.paymentMethod)
    record.tags?.forEach((tag) => tags.add(tag))

    if (record.age !== null) {
      minAge = minAge === null ? record.age : Math.min(minAge, record.age)
      maxAge = maxAge === null ? record.age : Math.max(maxAge, record.age)
    }
    if (record.dateMs) {
      minDate = minDate === null ? record.dateMs : Math.min(minDate, record.dateMs)
      maxDate = maxDate === null ? record.dateMs : Math.max(maxDate, record.dateMs)
    }
  })

  filterSnapshot = {
    regions: Array.from(regions).sort(),
    genders: Array.from(genders).sort(),
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    paymentMethods: Array.from(paymentMethods).sort(),
    minAge,
    maxAge,
    minDate,
    maxDate,
  }
}

export const initSalesStore = (dataFilePath) => {
  salesStore = loadSalesData(dataFilePath)
  computeFilters(salesStore)
  dataLoaded = true
  return salesStore.length
}

export const getFilterOptions = () => filterSnapshot

const containsSearch = (record, searchTerm) => {
  if (!searchTerm) return true
  const needle = searchTerm.toLowerCase()
  return (
    record.customerName?.toLowerCase().includes(needle) ||
    record.phoneNumber?.toLowerCase().includes(needle)
  )
}

const matchesList = (value, allowed) => {
  if (!allowed.length) return true
  if (!value) return false
  return allowed.includes(String(value).toLowerCase())
}

const matchesTags = (recordTags, requested) => {
  if (!requested.length) return true
  if (!recordTags?.length) return false
  const lowerTags = recordTags.map((tag) => tag.toLowerCase())
  return requested.some((tag) => lowerTags.includes(tag))
}

const matchesAge = (age, min, max) => {
  if (min === null && max === null) return true
  if (age === null) return false
  if (min !== null && max !== null && min > max) return 'invalid-range'
  if (min !== null && age < min) return false
  if (max !== null && age > max) return false
  return true
}

const matchesDate = (dateMs, from, to) => {
  if (!from && !to) return true
  if (!dateMs) return false
  if (from && to && from > to) return 'invalid-range'
  if (from && dateMs < from.getTime()) return false
  if (to && dateMs > to.getTime()) return false
  return true
}

const sortRecords = (records, sortBy, sortOrder) => {
  const order = sortOrder === 'asc' ? 1 : -1
  switch (sortBy) {
    case 'quantity':
      return records.sort((a, b) => (a.quantity - b.quantity) * order)
    case 'name':
      return records.sort((a, b) =>
        a.customerName.localeCompare(b.customerName) * (sortOrder === 'desc' ? -1 : 1),
      )
    case 'date':
    default:
      return records.sort((a, b) => (a.dateMs - b.dateMs) * order)
  }
}

export const querySales = (options) => {
  if (!dataLoaded) {
    throw new Error('Sales data not loaded. Call initSalesStore first.')
  }

  const {
    searchTerm,
    regions,
    genders,
    ageMin,
    ageMax,
    categories,
    tags,
    paymentMethods,
    dateFrom,
    dateTo,
    sortBy = 'date',
    sortOrder,
    page = 1,
    pageSize = 10,
  } = options

  const invalidReasons = []

  const filtered = salesStore.filter((record) => {
    if (!containsSearch(record, searchTerm)) return false
    if (!matchesList(record.customerRegion, regions)) return false
    if (!matchesList(record.gender, genders)) return false
    if (!matchesList(record.productCategory, categories)) return false
    if (!matchesList(record.paymentMethod, paymentMethods)) return false

    const ageCheck = matchesAge(record.age, ageMin, ageMax)
    if (ageCheck === 'invalid-range') {
      invalidReasons.push('ageRange')
      return false
    }
    if (!ageCheck) return false

    const dateCheck = matchesDate(record.dateMs, dateFrom, dateTo)
    if (dateCheck === 'invalid-range') {
      invalidReasons.push('dateRange')
      return false
    }
    if (!dateCheck) return false

    if (!matchesTags(record.tags, tags)) return false

    return true
  })

  if (invalidReasons.length) {
    return { invalid: true, reasons: invalidReasons }
  }

  const sorted = sortRecords([...filtered], sortBy, sortOrder || (sortBy === 'name' ? 'asc' : 'desc'))

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const pageData = sorted.slice(start, start + pageSize)

  return {
    data: pageData,
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}
