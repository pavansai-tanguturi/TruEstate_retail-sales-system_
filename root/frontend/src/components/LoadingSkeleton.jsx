import PropTypes from 'prop-types'

const LoadingSkeleton = ({ rows = 10 }) => {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Customer name</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Product Category</th>
            <th>Quantity</th>
            <th>Total Amount</th>
            <th>Customer region</th>
            <th>Product ID</th>
            <th>Employee name</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
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
          ))}
        </tbody>
      </table>
    </div>
  )
}

LoadingSkeleton.propTypes = {
  rows: PropTypes.number,
}

export default LoadingSkeleton