import styles from "../styles/TransactionsTable.module.css"
import { getStatusColor } from "../utils/calculations"

export function TransactionsTable({ reservations }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.transactionsTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Homeowner</th>
            <th>Facility</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                No transactions found
              </td>
            </tr>
          ) : (
            reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{new Date(reservation.createdAt).toLocaleDateString()}</td>
                <td>{reservation.homeownerName || "N/A"}</td>
                <td>{reservation.facilityName || "N/A"}</td>
                <td className={styles.amount}>₱{(reservation.totalAmount || 0).toLocaleString()}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusColor(reservation.status, styles)}`}>
                    {reservation.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
