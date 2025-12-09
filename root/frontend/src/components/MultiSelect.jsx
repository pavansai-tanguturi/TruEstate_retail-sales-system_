import PropTypes from 'prop-types'
import { memo } from 'react'

const MultiSelect = ({ label, options = [], selected = [], onChange, placeholder }) => {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="filter-block">
      <div className="filter-label">{label}</div>
      <div className="pill-group">
        {!options || options.length === 0 ? (
          <span className="pill pill-muted">{placeholder || 'No options'}</span>
        ) : (
          options.map((option) => (
            <button
              key={option}
              type="button"
              className={`pill ${selected.includes(option) ? 'pill-active' : ''}`}
              onClick={() => toggle(option)}
            >
              {option}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

MultiSelect.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}

export default memo(MultiSelect)
