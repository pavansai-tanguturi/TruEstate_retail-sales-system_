const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const buildQueryString = (query) => {
  const params = new URLSearchParams()
  const setList = (key, values) => {
    if (values && values.length) params.set(key, values.join(','))
  }

  if (query.search) params.set('search', query.search)
  setList('regions', query.regions)
  setList('genders', query.genders)
  setList('categories', query.categories)
  setList('tags', query.tags)
  setList('paymentMethods', query.paymentMethods)

  if (query.ageMin !== '' && query.ageMin !== null) params.set('ageMin', query.ageMin)
  if (query.ageMax !== '' && query.ageMax !== null) params.set('ageMax', query.ageMax)
  if (query.dateFrom) params.set('dateFrom', query.dateFrom)
  if (query.dateTo) params.set('dateTo', query.dateTo)

  params.set('sortBy', query.sortBy || 'date')
  if (query.sortOrder) params.set('sortOrder', query.sortOrder)
  params.set('page', query.page || 1)
  params.set('pageSize', query.pageSize || 10)

  return params.toString()
}

const handleResponse = async (res) => {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    const message = payload.message || 'Request failed'
    throw new Error(message)
  }
  return res.json()
}

export const fetchSales = async (query, signal) => {
  const qs = buildQueryString(query)
  const res = await fetch(`${BASE_URL}/api/sales?${qs}`, { signal })
  return handleResponse(res)
}

export const fetchFilters = async () => {
  const res = await fetch(`${BASE_URL}/api/filters`)
  return handleResponse(res)
}
