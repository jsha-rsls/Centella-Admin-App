// hoa/src/renderer/services/reservationService.js
import { supabase } from "../../utils/supabase"

// Helper to map DB rows to UI-friendly objects
const mapReservation = (row) => {
  const fullName = `${row.residents?.first_name || ""} ${row.residents?.middle_initial || ""} ${row.residents?.last_name || ""}`.trim()

  return {
    id: row.id,
    facility: row.facilities?.name || "Unknown Facility",
    reservantName: fullName || "Unknown Resident",
    address: `Blk ${row.residents?.block_number || ""} Lot ${row.residents?.lot_number || ""} ${row.residents?.phase_number ? "Phase " + row.residents.phase_number : ""}`.trim(),
    contactNumber: row.residents?.contact_number || "",
    email: row.residents?.email || "",
    date: row.reservation_date,        // YYYY-MM-DD
    startTime: row.start_time,         // HH:mm:ss
    endTime: row.end_time,             // HH:mm:ss
    eventName: row.purpose,
    status: row.status,                // pending / confirmed / cancelled / completed
    paymentStatus: row.payment_status, // pending / paid / cancelled / refunded
    paymentType: row.payment_type,     // cash / online / null
  }
}

export const reservationService = {
  // Fetch all reservations with facility + resident info
  async getAllReservations() {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        id,
        facility_id,
        user_id,
        reservation_date,
        start_time,
        end_time,
        purpose,
        status,
        payment_status,
        payment_type,
        facilities ( name ),
        residents ( first_name, middle_initial, last_name, contact_number, email, block_number, lot_number, phase_number )
      `)
      .order("reservation_date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching reservations:", error.message)
      throw error
    }

    return data.map(mapReservation)
  },

  // Subscribe to real-time changes on reservations table
  subscribeToReservations(callback) {
    const channel = supabase
      .channel("reservations-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events: INSERT, UPDATE, DELETE
          schema: "public",
          table: "reservations",
        },
        async (payload) => {
          console.log("Real-time change detected:", payload)
          
          // Fetch fresh data whenever a change occurs
          try {
            const freshData = await reservationService.getAllReservations()
            callback(freshData)
          } catch (error) {
            console.error("Error fetching updated reservations:", error)
          }
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
    }
  },

  async getReservationsByFacility(facilityId) {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        facilities ( name ),
        residents ( first_name, middle_initial, last_name, contact_number, email, block_number, lot_number, phase_number )
      `)
      .eq("facility_id", facilityId)

    if (error) {
      console.error("Error fetching reservations:", error.message)
      throw error
    }

    return data.map(mapReservation)
  },

  async createReservation(payload) {
    const { data, error } = await supabase
      .from("reservations")
      .insert([payload])
      .select(`
        *,
        facilities ( name ),
        residents ( first_name, middle_initial, last_name, contact_number, email, block_number, lot_number, phase_number )
      `)
      .single()

    if (error) throw error
    return mapReservation(data)
  },
}