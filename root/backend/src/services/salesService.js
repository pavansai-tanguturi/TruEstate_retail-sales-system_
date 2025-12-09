import { Sale } from '../models/Sale.js'

const buildMatch = (options) => {
  const match = {}
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
  } = options

  if (searchTerm) {
    const regex = new RegExp(searchTerm, 'i')
    match.$or = [{ customerName: regex }, { phoneNumber: regex }]
  }

  if (regions?.length) match.customerRegion = { $in: regions }
  if (genders?.length) match.gender = { $in: genders }
  if (categories?.length) match.productCategory = { $in: categories }
  if (paymentMethods?.length) match.paymentMethod = { $in: paymentMethods }
  if (tags?.length) match.tags = { $in: tags }

  if ((ageMin !== null && ageMin !== '') || (ageMax !== null && ageMax !== '')) {
    match.age = {}
    if (ageMin !== null && ageMin !== '') match.age.$gte = ageMin
    if (ageMax !== null && ageMax !== '') match.age.$lte = ageMax
  }

  if (dateFrom || dateTo) {
    match.date = {}
    if (dateFrom) match.date.$gte = new Date(dateFrom)
    if (dateTo) match.date.$lte = new Date(dateTo)
  }

  return match
}

const sortMap = (sortBy, sortOrder) => {
  const order = sortOrder === 'asc' ? 1 : -1
  switch (sortBy) {
    case 'quantity':
      return { quantity: order }
    case 'name':
      return { customerName: order }
    case 'date':
    default:
      return { date: order }
  }
}

export const querySales = async (options) => {
  const {
    searchTerm,
    regions = [],
    genders = [],
    ageMin = null,
    ageMax = null,
    categories = [],
    tags = [],
    paymentMethods = [],
    dateFrom,
    dateTo,
    sortBy = 'date',
    sortOrder,
    page = 1,
    pageSize = 10,
  } = options

  if (ageMin !== null && ageMax !== null && ageMin !== '' && ageMax !== '' && ageMin > ageMax) {
    return { invalid: true, reasons: ['ageRange'] }
  }
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    return { invalid: true, reasons: ['dateRange'] }
  }

  const match = buildMatch({
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
  })

  const safePage = Math.max(1, page)
  const size = Math.max(1, pageSize)
  const sort = sortMap(sortBy, sortOrder || (sortBy === 'name' ? 'asc' : 'desc'))

  const buildPipeline = (pageNumber) => {
    const pipeline = [{ $match: match }]
    
    // Add sort stage early for index utilization
    pipeline.push({ $sort: sort })
    
    // Use $facet for parallel processing
    pipeline.push({
      $facet: {
        data: [
          { $skip: (pageNumber - 1) * size }, 
          { $limit: size },
          // Project only needed fields to reduce network transfer
          {
            $project: {
              transactionId: 1,
              date: 1,
              customerId: 1,
              customerName: 1,
              phoneNumber: 1,
              gender: 1,
              age: 1,
              productCategory: 1,
              quantity: 1,
              totalAmount: 1,
              customerRegion: 1,
              productId: 1,
              employeeName: 1,
            }
          }
        ],
        meta: [{ $count: 'total' }],
      },
    })
    
    return pipeline
  }

  const run = async (pageNumber) => {
    const [result] = await Sale.aggregate(buildPipeline(pageNumber))
    const total = result?.meta?.[0]?.total || 0
    const totalPages = Math.max(1, Math.ceil(total / size))
    return { data: result?.data || [], total, totalPages }
  }

  const first = await run(safePage)
  const normalizedPage = Math.min(safePage, first.totalPages)

  if (normalizedPage !== safePage && first.total > 0) {
    const retry = await run(normalizedPage)
    return {
      data: retry.data,
      total: retry.total,
      page: normalizedPage,
      pageSize: size,
      totalPages: retry.totalPages,
    }
  }

  return {
    data: first.data,
    total: first.total,
    page: normalizedPage,
    pageSize: size,
    totalPages: first.totalPages,
  }
}

export const getFilterOptions = async () => {
  const [agg] = await Sale.aggregate([
    { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        regions: { $addToSet: '$customerRegion' },
        genders: { $addToSet: '$gender' },
        categories: { $addToSet: '$productCategory' },
        tags: { $addToSet: '$tags' },
        paymentMethods: { $addToSet: '$paymentMethod' },
        minAge: { $min: '$age' },
        maxAge: { $max: '$age' },
        minDate: { $min: '$date' },
        maxDate: { $max: '$date' },
      },
    },
  ])

  if (!agg) {
    return {
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
  }

  const sortStrings = (arr) => arr.filter(Boolean).map(String).sort()

  return {
    regions: sortStrings(agg.regions || []),
    genders: sortStrings(agg.genders || []),
    categories: sortStrings(agg.categories || []),
    tags: sortStrings(agg.tags || []),
    paymentMethods: sortStrings(agg.paymentMethods || []),
    minAge: agg.minAge ?? null,
    maxAge: agg.maxAge ?? null,
    minDate: agg.minDate ? agg.minDate.toISOString() : null,
    maxDate: agg.maxDate ? agg.maxDate.toISOString() : null,
  }
}
