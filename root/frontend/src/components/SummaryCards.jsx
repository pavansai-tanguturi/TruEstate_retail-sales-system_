import PropTypes from 'prop-types'
import { formatCurrency } from '../utils/formatters.js'

const SummaryCards = ({ total, pageTotal, amountSum }) => {
  const cards = [
    { label: 'Total records', value: total },
    { label: 'Records on page', value: pageTotal },
    { label: 'Total amount (page)', value: formatCurrency(amountSum) },
  ]
  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div key={card.label} className="summary-card">
          <div className="summary-label">{card.label}</div>
          <div className="summary-value">{card.value}</div>
        </div>
      ))}
    </div>
  )
}

SummaryCards.propTypes = {
  total: PropTypes.number.isRequired,
  pageTotal: PropTypes.number.isRequired,
  amountSum: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

export default SummaryCards
