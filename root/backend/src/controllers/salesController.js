import {
  parseDate,
  parseListParam,
  parseNumber,
  parsePagination,
} from '../utils/queryParser.js'
import { getFilterOptions, querySales } from '../services/salesService.js'

export const getSales = (req, res) => {
  const { page, pageSize } = parsePagination(req.query)
  const ageMin = parseNumber(req.query.ageMin)
  const ageMax = parseNumber(req.query.ageMax)
  const dateFrom = parseDate(req.query.dateFrom)
  const dateTo = parseDate(req.query.dateTo)

  const options = {
    searchTerm: req.query.search?.trim() || '',
    regions: parseListParam(req.query.regions),
    genders: parseListParam(req.query.genders),
    categories: parseListParam(req.query.categories),
    tags: parseListParam(req.query.tags),
    paymentMethods: parseListParam(req.query.paymentMethods),
    ageMin,
    ageMax,
    dateFrom,
    dateTo,
    sortBy: req.query.sortBy || 'date',
    sortOrder: req.query.sortOrder,
    page,
    pageSize,
  }

  if ((ageMin !== null && ageMax !== null && ageMin > ageMax) || (dateFrom && dateTo && dateFrom > dateTo)) {
    return res.status(400).json({ message: 'Invalid range supplied for age or date' })
  }

  const result = querySales(options)

  if (result.invalid) {
    return res.status(400).json({ message: 'Invalid range supplied', reasons: result.reasons })
  }

  return res.json(result)
}

export const getFilters = (_req, res) => {
  return res.json(getFilterOptions())
}
