/**
 * Overview Service
 * Aggregates all data for the Overview dashboard
 */

import { 
  getVerifiedResidentsCount, 
  getRecentUnverifiedResidents,
  getTodayReservations, 
  getFacilityReservationCounts, 
  getMonthlyIncome,
  getLatestAnnouncementsForOverview 
} from './overviewDataService'

/**
 * Get all data needed for the Overview dashboard
 * @returns {Promise<Object>} Object containing all overview data
 */
export const getOverviewData = async () => {
  try {
    // Fetch all data in parallel for better performance
    const [
      totalHomeowners,
      facilityCounts,
      monthlyIncome,
      recentResidents,
      todayReservations,
      announcements
    ] = await Promise.all([
      getVerifiedResidentsCount(),
      getFacilityReservationCounts(),
      getMonthlyIncome(),
      getRecentUnverifiedResidents(5),
      getTodayReservations(),
      getLatestAnnouncementsForOverview(3)
    ])

    // Format stats data
    const stats = {
      totalHomeowners,
      coveredCourtReserved: facilityCounts.coveredcourt?.reserved || 0,
      coveredCourtAvailable: facilityCounts.coveredcourt?.available || 0,
      multiPurposeReserved: facilityCounts.multipurposehall?.reserved || 0,
      multiPurposeAvailable: facilityCounts.multipurposehall?.available || 0,
      monthlyIncome: monthlyIncome
    }

    // Format recent activity data
    const recentActivity = recentResidents.map(resident => {
      const fullName = `${resident.last_name}, ${resident.first_name}${
        resident.middle_initial ? ` ${resident.middle_initial}` : ''
      }`
      const timeDiff = Math.floor((new Date() - new Date(resident.created_at)) / 60000) // minutes
      
      let timeText = 'new'
      if (timeDiff >= 1) {
        timeText = timeDiff === 1 ? '1 min ago' : `${timeDiff} mins ago`
        if (timeDiff >= 60) {
          const hours = Math.floor(timeDiff / 60)
          timeText = hours === 1 ? '1 hour ago' : `${hours} hours ago`
          if (hours >= 24) {
            const days = Math.floor(hours / 24)
            timeText = days === 1 ? '1 day ago' : `${days} days ago`
          }
        }
      }

      return {
        id: resident.id,
        name: fullName,
        time: timeText,
        status: 'to be review'
      }
    })

    // Format today's schedule by facility
    const todaySchedule = {
      coveredCourt: [],
      multiPurpose: []
    }

    todayReservations.forEach(reservation => {
      const facilityName = reservation.facilities?.name || ''
      const personName = `${reservation.residents?.last_name}, ${reservation.residents?.first_name}`
      
      // Format time from 24-hour to 12-hour format
      const formatTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'pm' : 'am'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        return `${displayHour}:${minutes}${ampm}`
      }

      const scheduleItem = {
        id: reservation.id,
        name: reservation.purpose,
        person: personName,
        time: `${formatTime(reservation.start_time)} - ${formatTime(reservation.end_time)}`,
        status: reservation.status
      }

      if (facilityName.toLowerCase().includes('covered court')) {
        todaySchedule.coveredCourt.push(scheduleItem)
      } else if (facilityName.toLowerCase().includes('multi-purpose')) {
        todaySchedule.multiPurpose.push(scheduleItem)
      }
    })

    // Format announcements
    const formattedAnnouncements = announcements.map(announcement => {
      const timeDiff = Math.floor((new Date() - new Date(announcement.published_at)) / 60000) // minutes
      
      let timeText = 'just now'
      if (timeDiff >= 60) {
        const hours = Math.floor(timeDiff / 60)
        timeText = hours === 1 ? '1 hour ago' : `${hours} hours ago`
        if (hours >= 24) {
          const days = Math.floor(hours / 24)
          timeText = days === 1 ? '1 day ago' : `${days} days ago`
        }
      } else if (timeDiff >= 1) {
        timeText = timeDiff === 1 ? '1 min ago' : `${timeDiff} mins ago`
      }

      return {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        time: timeText,
        type: announcement.category.toLowerCase()
      }
    })

    return {
      stats,
      recentActivity,
      todaySchedule,
      announcements: formattedAnnouncements
    }
  } catch (error) {
    console.error('Error fetching overview data:', error)
    throw error
  }
}