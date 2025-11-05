import { useState, useEffect, useCallback, useRef } from 'react'
import reservationAdminService from '../../../services/reservationAdminService'
import notificationSound from '../../../../assets/reservationsNotificationSounds/smile.ogg'

export const useReservations = () => {
  const [reservations, setReservations] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    goodStanding: 0
  })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Track previous pending reservation IDs to detect new ones
  const prevPendingIdsRef = useRef(new Set())
  const isInitializedRef = useRef(false)
  
  // Notification sound hook using native Audio API
  const playNotification = useCallback(() => {
    try {
      const audio = new Audio(notificationSound)
      audio.volume = 0.7
      audio.play().catch(err => console.error('Error playing notification:', err))
    } catch (error) {
      console.error('Error loading notification sound:', error)
    }
  }, [])

  // Load initial data
  const loadData = useCallback(async () => {
    const [reservationsResult, statsResult] = await Promise.all([
      reservationAdminService.getAllReservations(),
      reservationAdminService.getDashboardStats()
    ])

    if (reservationsResult.success) {
      setReservations(reservationsResult.data)
      
      // Initialize the pending IDs set on first load (don't play sound)
      if (!isInitializedRef.current) {
        const pendingReservations = reservationsResult.data.filter(r => r.status === 'pending')
        prevPendingIdsRef.current = new Set(pendingReservations.map(r => r.id))
        isInitializedRef.current = true
      }
    }

    if (statsResult.success) {
      setStats(statsResult.data)
    }
  }, [])

  // Load stats only
  const loadStats = useCallback(async () => {
    const statsResult = await reservationAdminService.getDashboardStats()
    if (statsResult.success) {
      setStats(statsResult.data)
    }
  }, [])

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((newReservations) => {
    // Get current pending reservations
    const currentPending = newReservations.filter(r => r.status === 'pending')
    const currentPendingIds = new Set(currentPending.map(r => r.id))
    
    // Only check for new reservations after initialization
    if (isInitializedRef.current) {
      // Find new pending reservation IDs that weren't in previous set
      const newPendingIds = [...currentPendingIds].filter(
        id => !prevPendingIdsRef.current.has(id)
      )
      
      if (newPendingIds.length > 0) {
        console.log('🔔 New pending reservation(s) received!', newPendingIds)
        playNotification()
      }
    }
    
    // Update the ref with current pending IDs
    prevPendingIdsRef.current = currentPendingIds
    
    setReservations(newReservations)
    // Also refresh stats when reservations change
    loadStats()
  }, [loadStats, playNotification])

  // Initial load and setup real-time subscriptions
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await loadData()
      setLoading(false)
    }

    initializeData()

    // Subscribe to real-time changes
    const unsubscribe = reservationAdminService.subscribeToAll(handleRealtimeUpdate)

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribe()
    }
  }, [loadData, handleRealtimeUpdate])

  const handleApprove = async (reservationId) => {
    if (processing) return

    setProcessing(true)
    
    const result = await reservationAdminService.approveReservation(reservationId)

    if (!result.success) {
      alert(`Error: ${result.error}`)
    }
    // No need to manually reload - real-time subscription will handle it
    
    setProcessing(false)
  }

  const handleReject = async (reservationId) => {
    if (processing) return

    setProcessing(true)
    
    const result = await reservationAdminService.rejectReservation(reservationId)

    if (!result.success) {
      alert(`Error: ${result.error}`)
    }
    // No need to manually reload - real-time subscription will handle it
    
    setProcessing(false)
  }

  const handleImportCSV = async (file) => {
    if (!file) return

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        const text = event.target.result
        const rows = text.split('\n').filter(row => row.trim())
        
        const dataRows = rows.slice(1)
        
        const csvData = dataRows.map(row => {
          const values = row.split(',').map(v => v.trim())
          return {
            resident_id: parseInt(values[0]),
            first_name: values[1],
            last_name: values[2],
            good_standing: values[3]?.toLowerCase() === 'true' || values[3] === '1'
          }
        }).filter(item => item.resident_id && !isNaN(item.resident_id))

        if (csvData.length === 0) {
          reject(new Error('No valid data in CSV'))
          return
        }

        if (!confirm(`Import ${csvData.length} records?`)) {
          resolve(null)
          return
        }

        setProcessing(true)
        
        const result = await reservationAdminService.bulkUpdateResidents(csvData)

        setProcessing(false)

        if (result.success) {
          // No need to manually reload - real-time subscription will handle it
          resolve(result.data)
        } else {
          reject(new Error(result.error))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  return {
    reservations,
    stats,
    loading,
    processing,
    handleApprove,
    handleReject,
    handleImportCSV
  }
}