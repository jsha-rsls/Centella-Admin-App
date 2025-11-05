import { useState, useEffect } from "react"
import reservationAdminService from "../../../services/reservationAdminService"

export const useReservations = () => {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    loadReservations()

    const unsubscribe = reservationAdminService.subscribeToAll((data) => {
      setReservations(data)
    })

    return () => unsubscribe()
  }, [])

  const loadReservations = async () => {
    const result = await reservationAdminService.getAllReservations()
    if (result.success) {
      setReservations(result.data)
    }
  }

  return { reservations, loadReservations }
}
