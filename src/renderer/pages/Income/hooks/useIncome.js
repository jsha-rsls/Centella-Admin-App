// hooks/useIncome.js
import { useState, useEffect } from "react"
import incomeService from "../../../services/incomeService"

export const useIncome = () => {
  const [reservations, setReservations] = useState([])
  const [stats, setStats] = useState({
    totalIncome: 0,
    monthlyIncome: 0,
    pendingPayments: 0,
    totalTransactions: 0,
    pendingTransactions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIncomeData()

    const unsubscribe = incomeService.subscribeToIncomeChanges((data) => {
      setReservations(data)
      // Refresh stats when data changes
      loadStats()
    })

    return () => unsubscribe()
  }, [])

  const loadIncomeData = async () => {
    setLoading(true)
    const result = await incomeService.getAllReservationsForIncome()
    if (result.success) {
      setReservations(result.data)
    }
    await loadStats()
    setLoading(false)
  }

  const loadStats = async () => {
    const result = await incomeService.getIncomeStats()
    if (result.success) {
      setStats(result.data)
    }
  }

  return { 
    reservations, 
    stats, 
    loading, 
    loadIncomeData 
  }
}