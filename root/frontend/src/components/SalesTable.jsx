import PropTypes from 'prop-types'
import { memo } from 'react'
import { formatCurrency, formatDate } from '../utils/formatters.js'

const headers = [
  'Transaction ID',
  'Date',
  'Customer ID',
  'Customer name',
  'Phone Number',
  'Gender',
  'Age',
  'Product Category',
  'Quantity',
  'Total Amount',
  'Customer region',
  'Product ID',
  'Employee name',
]

const SalesTable = ({ rows = [], loading }) => {
  if (!loading && rows && rows.length === 0) {
    return <div className="empty-state">No results found for the chosen filters.</div>
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((title) => (
              <th key={title}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 10 }, (_, i) => (
              <tr key={i} className="skeleton-row">
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
                <td><div className="skeleton-item"></div></td>
              </tr>
            ))
          ) : (
            rows.map((row) => (
              <tr key={`${row.transactionId}-${row.date}`}>
                <td>{row.transactionId}</td>
                <td>{formatDate(row.date)}</td>
                <td>{row.customerId}</td>
                <td>{row.customerName}</td>
                <td>{row.phoneNumber}</td>
                <td>{row.gender}</td>
                <td>{row.age ?? '—'}</td>
                <td>{row.productCategory}</td>
                <td>{row.quantity ?? '—'}</td>
                <td>{formatCurrency(row.totalAmount)}</td>
                <td>{row.customerRegion}</td>
                <td>{row.productId}</td>
                <td>{row.employeeName}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

SalesTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
}

// Memoize the component to prevent unnecessary re-renders
export default memo(SalesTable)
