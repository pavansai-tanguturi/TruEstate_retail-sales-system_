import PropTypes from 'prop-types'
import { useState } from 'react'

const Pagination = ({ page, totalPages, pageSize, pageSizeOptions, onPageChange, onPageSizeChange }) => {
  const [jumpToPage, setJumpToPage] = useState('')

  const handleJumpSubmit = (e) => {
    e.preventDefault()
    const pageNum = parseInt(jumpToPage, 10)
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
      setJumpToPage('')
    }
  }

  const getVisiblePages = () => {
    const delta = 2 // Show 2 pages before and after current page
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="pagination">
      <div className="page-size-selector">
        <label>
          Show:
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>

      <button type="button" onClick={() => onPageChange(1)} disabled={page === 1}>
        First
      </button>
      <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
        Prev
      </button>
      
      <div className="page-list">
        {visiblePages.map((p, idx) => 
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="page-ellipsis">...</span>
          ) : (
            <button
              key={p}
              type="button"
              className={p === page ? 'active' : ''}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </button>
      <button type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>
        Last
      </button>

      <form onSubmit={handleJumpSubmit} className="jump-to-page">
        <input
          type="number"
          value={jumpToPage}
          onChange={(e) => setJumpToPage(e.target.value)}
          placeholder="Go to page"
          min="1"
          max={totalPages}
        />
        <button type="submit">Go</button>
      </form>
    </div>
  )
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
}

export default Pagination
