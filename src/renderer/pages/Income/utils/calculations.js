export const calculateStats = (reservations) => {
  // Total income from confirmed and completed reservations
  const confirmedOrCompleted = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "completed"
  )
  const totalIncome = confirmedOrCompleted.reduce(
    (sum, r) => sum + (r.totalAmount || 0), 
    0
  )

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Monthly income from confirmed and completed reservations
  const monthlyIncome = confirmedOrCompleted
    .filter((r) => {
      const date = new Date(r.createdAt)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0)

  // Pending payments are reservations with "pending" status
  const pendingPayments = reservations
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0)

  return { totalIncome, monthlyIncome, pendingPayments }
}

export const getStatusColor = (status, styles) => {
  switch (status) {
    case "completed":
    case "confirmed":
      return styles.completed
    case "pending":
      return styles.pending
    case "rejected":
    case "cancelled":
      return styles.failed
    default:
      return ""
  }
}