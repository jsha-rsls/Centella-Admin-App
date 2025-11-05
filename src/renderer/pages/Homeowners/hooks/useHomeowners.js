import { useState, useEffect, useCallback, useRef } from 'react'
import notificationSound from '../../../../assets/reservationsNotificationSounds/opening.ogg'
import { supabase } from '../../../../utils/supabase' // Add this import
import {
  getPendingRegistrations,
  getRegisteredHomeowners,
  getRejectedRegistrations,
  verifyRegistration,
  rejectRegistration,
  reconsiderRegistration,
  deleteRegistration,
} from '../../../services/homeownerService'

export const useHomeowners = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([])
  const [registeredHomeowners, setRegisteredHomeowners] = useState([])
  const [rejectedRegistrations, setRejectedRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  // Track previous pending registration IDs to detect new ones
  const prevPendingIdsRef = useRef(new Set())
  const isInitializedRef = useRef(false)

  // Notification sound player
  const playNotification = useCallback(() => {
    try {
      const audio = new Audio(notificationSound)
      audio.volume = 0.7
      audio.play().catch(err => console.error('Error playing notification:', err))
    } catch (error) {
      console.error('Error loading notification sound:', error)
    }
  }, [])

  // Fetch homeowners data
  const fetchHomeownersData = useCallback(async () => {
    try {
      const { data: pendingData, error: pendingError } = await getPendingRegistrations()
      if (pendingError) throw pendingError

      const { data: registeredData, error: registeredError } = await getRegisteredHomeowners()
      if (registeredError) throw registeredError

      const { data: rejectedData, error: rejectedError } = await getRejectedRegistrations()
      if (rejectedError) throw rejectedError

      const newPendingData = pendingData || []
      setPendingRegistrations(newPendingData)
      setRegisteredHomeowners(registeredData || [])
      setRejectedRegistrations(rejectedData || [])

      // Check for new pending registrations
      const currentPendingIds = new Set(newPendingData.map(r => r.id))

      // Only check for new registrations after initialization
      if (isInitializedRef.current) {
        const newPendingIds = [...currentPendingIds].filter(
          id => !prevPendingIdsRef.current.has(id)
        )

        if (newPendingIds.length > 0) {
          console.log('🔔 New pending registration(s) received!', newPendingIds)
          playNotification()
        }
      }

      // Update the ref with current pending IDs
      prevPendingIdsRef.current = currentPendingIds

      // Mark as initialized after first load
      if (!isInitializedRef.current) {
        isInitializedRef.current = true
      }

      return { success: true }
    } catch (err) {
      console.error("Error fetching homeowners data:", err)
      setError(err.message || "Failed to load homeowners data")
      return { success: false, error: err }
    }
  }, [playNotification])

  // Initial load and setup real-time subscription using homeownerService
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      setError(null)
      await fetchHomeownersData()
      setLoading(false)
    }

    initializeData()

    // The homeownerService already has real-time subscriptions built-in
    // We just need to poll or rely on the service's internal mechanism
    // Set up a periodic check or use the service's subscription if available
    const interval = setInterval(() => {
      fetchHomeownersData()
    }, 5000) // Check every 5 seconds for updates

    return () => {
      clearInterval(interval)
    }
  }, [fetchHomeownersData])

  // Action handlers
  const handleVerify = useCallback(async (registrationId) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("No authenticated user found")
      return { success: false, error: "Authentication required. Please log in again." }
    }

    const { error } = await verifyRegistration(registrationId, user.id)
    
    if (error) {
      console.error("Error verifying registration:", error)
      return { success: false, error: "Failed to verify registration. Please try again." }
    }

    await fetchHomeownersData()
    return { success: true }
  }, [fetchHomeownersData])

  const handleReject = useCallback(async (registrationId, reason) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("No authenticated user found")
      return { success: false, error: "Authentication required. Please log in again." }
    }

    // Pass parameters in correct order: residentId, adminUserId, reason
    const { error } = await rejectRegistration(registrationId, user.id, reason)
    
    if (error) {
      console.error("Error rejecting registration:", error)
      return { success: false, error: "Failed to reject registration. Please try again." }
    }

    await fetchHomeownersData()
    return { success: true }
  }, [fetchHomeownersData])

  const handleReconsider = useCallback(async (registrationId) => {
    const { error } = await reconsiderRegistration(registrationId)
    
    if (error) {
      console.error("Error reconsidering registration:", error)
      return { success: false, error: "Failed to reconsider registration. Please try again." }
    }

    await fetchHomeownersData()
    return { success: true }
  }, [fetchHomeownersData])

  const handleDelete = useCallback(async (registrationId) => {
    const { error } = await deleteRegistration(registrationId)
    
    if (error) {
      console.error("Error deleting registration:", error)
      return { success: false, error: "Failed to delete registration. Please try again." }
    }

    await fetchHomeownersData()
    return { success: true }
  }, [fetchHomeownersData])

  return {
    pendingRegistrations,
    registeredHomeowners,
    rejectedRegistrations,
    loading,
    error,
    currentUser,
    fetchHomeownersData,
    handleVerify,
    handleReject,
    handleReconsider,
    handleDelete
  }
}