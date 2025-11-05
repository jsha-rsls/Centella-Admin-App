export const filterReservationsByPeriod = (reservations, period) => {
  const now = new Date()

  switch (period) {
    case "week":
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return reservations.filter((r) => new Date(r.createdAt) >= weekAgo)
    case "month":
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return reservations.filter((r) => new Date(r.createdAt) >= monthAgo)
    case "year":
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      return reservations.filter((r) => new Date(r.createdAt) >= yearAgo)
    default:
      return reservations
  }
}

export const applyFilters = (reservations, period, filterStatus, filterDateRange) => {
  let filtered = filterReservationsByPeriod(reservations, period)

  if (filterStatus !== "all") {
    filtered = filtered.filter((r) => r.status === filterStatus)
  }

  if (filterDateRange.start) {
    filtered = filtered.filter((r) => new Date(r.createdAt) >= new Date(filterDateRange.start))
  }

  if (filterDateRange.end) {
    filtered = filtered.filter((r) => new Date(r.createdAt) <= new Date(filterDateRange.end))
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return filtered
}
