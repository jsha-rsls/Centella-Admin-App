// hoa/src/renderer/services/incomeService.js

import { supabase } from "../../utils/supabase"

class IncomeService {
  constructor() {
    this.incomeChannel = null
  }

  /**
   * Get all confirmed (paid) reservations with resident and facility details
   * Returns reservations with status='confirmed' OR payment_status='paid'
   */
  async getAllConfirmedPayments() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          residents!inner(
            id,
            first_name,
            last_name,
            middle_initial,
            contact_number,
            email,
            block_number,
            lot_number,
            phase_number,
            good_standing
          ),
          facilities!inner(
            id,
            name,
            price,
            price_unit
          )
        `)
        .or('status.eq.confirmed,status.eq.completed')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform snake_case to camelCase for easier frontend use
      const transformedData = data?.map(reservation => ({
        id: reservation.id,
        userId: reservation.user_id,
        facilityId: reservation.facility_id,
        reservationDate: reservation.reservation_date,
        startTime: reservation.start_time,
        endTime: reservation.end_time,
        durationHours: reservation.duration_hours,
        purpose: reservation.purpose,
        totalAmount: parseFloat(reservation.total_amount),
        status: reservation.status,
        paymentStatus: reservation.payment_status,
        paymentType: reservation.payment_type,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at,
        paymentLinkId: reservation.payment_link_id,
        paymentLinkUrl: reservation.payment_link_url,
        paymongoPaymentId: reservation.paymongo_payment_id,
        paymongoPaymentMethod: reservation.paymongo_payment_method,
        // Resident info
        homeownerName: `${reservation.residents.first_name} ${reservation.residents.last_name}`,
        residentFirstName: reservation.residents.first_name,
        residentLastName: reservation.residents.last_name,
        residentMiddleInitial: reservation.residents.middle_initial,
        residentContact: reservation.residents.contact_number,
        residentEmail: reservation.residents.email,
        blockNumber: reservation.residents.block_number,
        lotNumber: reservation.residents.lot_number,
        phaseNumber: reservation.residents.phase_number,
        goodStanding: reservation.residents.good_standing,
        // Facility info
        facilityName: reservation.facilities.name,
        facilityPrice: parseFloat(reservation.facilities.price),
        facilityPriceUnit: reservation.facilities.price_unit,
      })) || []
      
      return { success: true, data: transformedData }
    } catch (error) {
      console.error('Error fetching confirmed payments:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all reservations (all statuses) for income tracking
   */
  async getAllReservationsForIncome() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          residents!inner(
            id,
            first_name,
            last_name,
            middle_initial,
            contact_number,
            email,
            block_number,
            lot_number,
            phase_number,
            good_standing
          ),
          facilities!inner(
            id,
            name,
            price,
            price_unit
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform snake_case to camelCase
      const transformedData = data?.map(reservation => ({
        id: reservation.id,
        userId: reservation.user_id,
        facilityId: reservation.facility_id,
        reservationDate: reservation.reservation_date,
        startTime: reservation.start_time,
        endTime: reservation.end_time,
        durationHours: reservation.duration_hours,
        purpose: reservation.purpose,
        totalAmount: parseFloat(reservation.total_amount),
        status: reservation.status,
        paymentStatus: reservation.payment_status,
        paymentType: reservation.payment_type,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at,
        paymentLinkId: reservation.payment_link_id,
        paymentLinkUrl: reservation.payment_link_url,
        paymongoPaymentId: reservation.paymongo_payment_id,
        paymongoPaymentMethod: reservation.paymongo_payment_method,
        // Resident info
        homeownerName: `${reservation.residents.first_name} ${reservation.residents.last_name}`,
        residentFirstName: reservation.residents.first_name,
        residentLastName: reservation.residents.last_name,
        residentMiddleInitial: reservation.residents.middle_initial,
        residentContact: reservation.residents.contact_number,
        residentEmail: reservation.residents.email,
        blockNumber: reservation.residents.block_number,
        lotNumber: reservation.residents.lot_number,
        phaseNumber: reservation.residents.phase_number,
        goodStanding: reservation.residents.good_standing,
        // Facility info
        facilityName: reservation.facilities.name,
        facilityPrice: parseFloat(reservation.facilities.price),
        facilityPriceUnit: reservation.facilities.price_unit,
      })) || []
      
      return { success: true, data: transformedData }
    } catch (error) {
      console.error('Error fetching reservations for income:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get income statistics
   */
  async getIncomeStats() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('status, payment_status, total_amount, created_at')

      if (error) throw error

      // Calculate total income (confirmed and completed)
      const confirmedReservations = data.filter(
        r => r.status === 'confirmed' || r.status === 'completed'
      )
      const totalIncome = confirmedReservations.reduce(
        (sum, r) => sum + parseFloat(r.total_amount || 0), 
        0
      )

      // Calculate monthly income
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      const monthlyIncome = confirmedReservations
        .filter(r => {
          const date = new Date(r.created_at)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        })
        .reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0)

      // Calculate pending payments (pending status only)
      const pendingPayments = data
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0)

      return {
        success: true,
        data: {
          totalIncome,
          monthlyIncome,
          pendingPayments,
          totalTransactions: confirmedReservations.length,
          pendingTransactions: data.filter(r => r.status === 'pending').length
        }
      }
    } catch (error) {
      console.error('Error fetching income stats:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Subscribe to real-time reservation changes for income updates
   * @param {Function} onUpdate - Callback function when data changes
   * @returns {Function} Cleanup function to unsubscribe
   */
  subscribeToIncomeChanges(onUpdate) {
    // Remove existing subscription if any
    if (this.incomeChannel) {
      supabase.removeChannel(this.incomeChannel)
    }

    // Create new subscription
    this.incomeChannel = supabase
      .channel('income_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'reservations'
        },
        async (payload) => {
          console.log('Income-related reservation change detected:', payload)
          
          // Fetch fresh data and trigger callback
          const result = await this.getAllReservationsForIncome()
          if (result.success) {
            onUpdate(result.data)
          }
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      if (this.incomeChannel) {
        supabase.removeChannel(this.incomeChannel)
        this.incomeChannel = null
      }
    }
  }

  /**
   * Mark reservation as completed (for manual completion)
   */
  async markAsCompleted(reservationId) {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)

      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Error marking reservation as completed:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new IncomeService()