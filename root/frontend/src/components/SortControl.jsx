import PropTypes from 'prop-types'

const SortControl = ({ sortBy, sortOrder, onChange }) => {
  const handleSortBy = (value) => onChange({ sortBy: value, sortOrder: value === 'name' ? 'asc' : 'desc' })

  return (
    <div className="sort-control">
      <label htmlFor="sort-select">Sort by</label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => handleSortBy(e.target.value)}
      >
        <option value="date">Date (Newest)</option>
        <option value="quantity">Quantity</option>
        <option value="name">Customer Name (A–Z)</option>
      </select>
      <button
        type="button"
        className="sort-order"
        onClick={() => onChange({ sortBy, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' })}
      >
        {sortOrder === 'asc' ? 'Asc' : 'Desc'}
      </button>
    </div>
  )
}

SortControl.propTypes = {
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default SortControl
