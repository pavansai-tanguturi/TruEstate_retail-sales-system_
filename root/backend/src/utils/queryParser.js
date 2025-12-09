const splitToArray = (value) => {
  if (!value) return []
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const parseListParam = (value) => splitToArray(value)

export const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export const parseDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const pageSize = Math.max(1, parseInt(query.pageSize, 10) || 10)
  return { page, pageSize }
}
