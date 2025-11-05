import { IonIcon } from "@ionic/react"
import {
  calendarOutline,
  basketballOutline,
  businessOutline,
  chevronBackOutline,
  chevronForwardOutline,
  todayOutline,
  calendarNumberOutline,
  trendingUpOutline,
  arrowBackOutline, // Added icon for back button
} from "ionicons/icons"
import { getCalendarDays, formatDate, formatTime, monthNames } from "../utils/dateUtils"
import {
  getReservationsForDate,
  getTodayReservations,
  getThisWeekReservations,
  getNextMonthReservations,
  getStatusClass,
} from "../utils/reservationUtils"
import styles from "../styles/CalendarView.module.css"

// Helper to format date without timezone issues
const formatDateToString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Helper to compare dates ignoring time
const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false
  return formatDateToString(date1) === formatDateToString(date2)
}

// Add this helper function at the top with your other helpers in CalendarView.jsx:
const isPastDate = (date) => {
  return formatDateToString(date) < formatDateToString(new Date())
}

function CalendarView({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  setSelectedReservation,
  reservations,
}) {
  return (
    <div className={styles.calendarLayout}>
      <div className={styles.calendarSection}>
        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <h2>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className={styles.calendarNav}>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className={styles.backButton}
                  aria-label="Back to Quick Stats"
                  title="Back to Quick Stats"
                >
                  <IonIcon icon={arrowBackOutline} />
                  <span>Quick Stats</span>
                </button>
              )}
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className={styles.navButton}
                aria-label="Previous month"
              >
                <IonIcon icon={chevronBackOutline} />
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  setCurrentDate(today)
                  setSelectedDate(today)
                }}
                className={styles.todayButton}
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className={styles.navButton}
                aria-label="Next month"
              >
                <IonIcon icon={chevronForwardOutline} />
              </button>
            </div>
          </div>

          <div className={styles.calendar}>
            <div className={styles.calendarDays}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className={styles.dayHeader}>
                  {day}
                </div>
              ))}
            </div>
            <div className={styles.calendarGrid}>
              {getCalendarDays(currentDate).map((date, index) => {
                const dayReservations = getReservationsForDate(date, reservations)
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isToday = isSameDate(date, new Date())
                const isSelected = selectedDate && isSameDate(date, selectedDate)
                const isPast = isPastDate(date) && !isToday

                return (
                  <div
                    key={index}
                    className={`${styles.calendarDay} ${!isCurrentMonth ? styles.otherMonth : ""} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""} ${isPast ? styles.pastDate : ""} ${dayReservations.length > 0 ? styles.hasEvents : ""}`}
                    onClick={() => {
                      setSelectedDate(date)
                      // Auto-navigate to the month of the clicked date if it's from a different month
                      if (!isCurrentMonth) {
                        setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))
                      }
                    }}
                  >
                    <span className={styles.dayNumber}>{date.getDate()}</span>
                    {dayReservations.length > 0 && (
                      <div className={styles.eventDots}>
                        {dayReservations.slice(0, 3).map((res, i) => (
                          <div
                            key={i}
                            className={`${styles.eventDot} ${res.facility === "Covered Court" ? styles.courtDot : styles.hallDot}`}
                            title={`${res.facility}: ${res.eventName}`}
                          />
                        ))}
                        {dayReservations.length > 3 && (
                          <span className={styles.moreEvents}>+{dayReservations.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className={styles.facilityLegend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.courtDot}`} />
                <span className={styles.legendLabel}>Covered Court</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.hallDot}`} />
                <span className={styles.legendLabel}>Multi Purpose Hall</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sidebarSection}>
        {selectedDate ? (
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <h3>{formatDate(formatDateToString(selectedDate))}</h3>
              {getReservationsForDate(selectedDate, reservations).length > 0 && (
                <span className={styles.reservationCount}>
                  {getReservationsForDate(selectedDate, reservations).length}{" "}
                  {getReservationsForDate(selectedDate, reservations).length === 1 ? "reservation" : "reservations"}
                </span>
              )}
            </div>
            <div className={styles.dayReservations}>
              {getReservationsForDate(selectedDate, reservations).length > 0 ? (
                getReservationsForDate(selectedDate, reservations).map((reservation) => (
                  <div
                    key={reservation.id}
                    className={styles.reservationCard}
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    <div className={styles.reservationHeader}>
                      <span className={styles.facilityTag}>
                        <IonIcon
                          icon={reservation.facility === "Covered Court" ? basketballOutline : businessOutline}
                        />
                        {reservation.facility}
                      </span>
                      <span className={`${styles.statusBadge} ${getStatusClass(reservation.status, styles)}`}>
                        {reservation.status}
                      </span>
                    </div>
                    <h4>{reservation.eventName}</h4>
                    <p className={styles.timeRange}>
                      {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                    </p>
                    <p className={styles.reservantName}>by {reservation.reservantName}</p>
                  </div>
                ))
              ) : (
                <div className={styles.noReservations}>
                  <div className={styles.noReservationsIcon}>
                    <IonIcon icon={calendarOutline} />
                  </div>
                  <p>No reservations for this date</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.sidebarCard}>
            <h3 className={styles.statsTitle}>Quick Stats</h3>
            <div className={styles.statsGrid}>
              <div className={`${styles.statItem} ${styles.statTotal}`}>
                <div className={styles.statIcon}>
                  <IonIcon icon={calendarOutline} />
                </div>
                <div className={styles.statNumber}>{reservations.length}</div>
                <div className={styles.statLabel}>Total Reservations</div>
              </div>
              <div className={`${styles.statItem} ${styles.statToday}`}>
                <div className={styles.statIcon}>
                  <IonIcon icon={todayOutline} />
                </div>
                <div className={styles.statNumber}>{getTodayReservations(reservations).length}</div>
                <div className={styles.statLabel}>Today</div>
              </div>
              <div className={`${styles.statItem} ${styles.statWeek}`}>
                <div className={styles.statIcon}>
                  <IonIcon icon={calendarNumberOutline} />
                </div>
                <div className={styles.statNumber}>{getThisWeekReservations(reservations).length}</div>
                <div className={styles.statLabel}>This Week</div>
              </div>
              <div className={`${styles.statItem} ${styles.statMonth}`}>
                <div className={styles.statIcon}>
                  <IonIcon icon={trendingUpOutline} />
                </div>
                <div className={styles.statNumber}>{getNextMonthReservations(reservations).length}</div>
                <div className={styles.statLabel}>Next Month</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarView
