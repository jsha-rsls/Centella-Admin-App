import { useState, useEffect } from "react"
import { applyFilters } from "../utils/filters"

export const useFilters = (reservations) => {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDateRange, setFilterDateRange] = useState({ start: "", end: "" })
  const [filteredReservations, setFilteredReservations] = useState([])

  useEffect(() => {
    const filtered = applyFilters(reservations, selectedPeriod, filterStatus, filterDateRange)
    setFilteredReservations(filtered)
  }, [reservations, selectedPeriod, filterStatus, filterDateRange])

  const resetFilters = () => {
    setFilterStatus("all")
    setFilterDateRange({ start: "", end: "" })
  }

  return {
    selectedPeriod,
    setSelectedPeriod,
    filterStatus,
    setFilterStatus,
    filterDateRange,
    setFilterDateRange,
    filteredReservations,
    resetFilters,
  }
}
