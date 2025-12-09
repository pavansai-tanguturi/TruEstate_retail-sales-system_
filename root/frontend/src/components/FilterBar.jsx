import PropTypes from 'prop-types'
import MultiSelect from './MultiSelect.jsx'

const FilterBar = ({ filtersMeta, query, onUpdate }) => {
  const handleArrayChange = (key) => (values) => onUpdate({ [key]: values, page: 1 })

  return (
    <div className="filter-bar">
      <MultiSelect
        label="Customer Region"
        options={filtersMeta.regions}
        selected={query.regions}
        onChange={handleArrayChange('regions')}
      />
      <MultiSelect
        label="Gender"
        options={filtersMeta.genders}
        selected={query.genders}
        onChange={handleArrayChange('genders')}
      />
      <div className="filter-block">
        <div className="filter-label">Age Range</div>
        <div className="range-inputs">
          <input
            type="number"
            value={query.ageMin ?? ''}
            placeholder={filtersMeta.minAge ?? 'Min'}
            onChange={(e) => onUpdate({ ageMin: e.target.value ? Number(e.target.value) : '', page: 1 })}
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            value={query.ageMax ?? ''}
            placeholder={filtersMeta.maxAge ?? 'Max'}
            onChange={(e) => onUpdate({ ageMax: e.target.value ? Number(e.target.value) : '', page: 1 })}
          />
        </div>
      </div>
      <MultiSelect
        label="Product Category"
        options={filtersMeta.categories}
        selected={query.categories}
        onChange={handleArrayChange('categories')}
      />
      <MultiSelect
        label="Tags"
        options={filtersMeta.tags}
        selected={query.tags}
        onChange={handleArrayChange('tags')}
        placeholder="No tags"
      />
      <MultiSelect
        label="Payment Method"
        options={filtersMeta.paymentMethods}
        selected={query.paymentMethods}
        onChange={handleArrayChange('paymentMethods')}
      />
      <div className="filter-block">
        <div className="filter-label">Date Range</div>
        <div className="range-inputs">
          <input
            type="date"
            value={query.dateFrom}
            onChange={(e) => onUpdate({ dateFrom: e.target.value, page: 1 })}
            min={filtersMeta.minDate ? new Date(filtersMeta.minDate).toISOString().slice(0, 10) : undefined}
            max={filtersMeta.maxDate ? new Date(filtersMeta.maxDate).toISOString().slice(0, 10) : undefined}
          />
          <span className="range-separator">to</span>
          <input
            type="date"
            value={query.dateTo}
            onChange={(e) => onUpdate({ dateTo: e.target.value, page: 1 })}
            min={filtersMeta.minDate ? new Date(filtersMeta.minDate).toISOString().slice(0, 10) : undefined}
            max={filtersMeta.maxDate ? new Date(filtersMeta.maxDate).toISOString().slice(0, 10) : undefined}
          />
        </div>
      </div>
    </div>
  )
}

FilterBar.propTypes = {
  filtersMeta: PropTypes.shape({
    regions: PropTypes.arrayOf(PropTypes.string),
    genders: PropTypes.arrayOf(PropTypes.string),
    categories: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    paymentMethods: PropTypes.arrayOf(PropTypes.string),
    minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minAge: PropTypes.number,
    maxAge: PropTypes.number,
  }).isRequired,
  query: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
}

export default FilterBar
