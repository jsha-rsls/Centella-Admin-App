import { IonIcon } from "@ionic/react"
import { calendarOutline, statsChartOutline, personOutline, calendarClearOutline } from "ionicons/icons"
import { formatTime } from "../utils/dateUtils"
import {
  getTodayReservations,
  getThisWeekReservations,
  getNextMonthReservations,
  getStatusClass,
} from "../utils/reservationUtils"
import styles from "../styles/SummaryView.module.css"

function SummaryView({ reservations }) {
  return (
    <div className={styles.summaryLayout}>
      <div className={styles.summaryCard}>
        <h3>
          <IonIcon icon={calendarOutline} />
          Today's Reservations
        </h3>
        <div className={`${styles.reservationsList} ${styles.reservationsListToday}`}>
          {getTodayReservations(reservations).length > 0 ? (
            getTodayReservations(reservations).map((reservation) => (
              <div key={reservation.id} className={styles.summaryReservation}>
                <div className={styles.summaryTime}>
                  {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                </div>
                <div className={styles.summaryContent}>
                  <h4>{reservation.eventName}</h4>
                  <p>
                    {reservation.facility} • {reservation.reservantName}
                  </p>
                </div>
                <span className={`${styles.statusBadge} ${getStatusClass(reservation.status, styles)}`}>
                  {reservation.status}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.noReservations}>
              <IonIcon icon={calendarClearOutline} className={styles.noReservationsIcon} />
              <p>No reservations today</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.summaryCard}>
        <h3>
          <IonIcon icon={statsChartOutline} />
          This Week's Reservations
        </h3>
        <div className={`${styles.reservationsList} ${styles.reservationsListWeek}`}>
          {getThisWeekReservations(reservations).map((reservation) => (
            <div key={reservation.id} className={styles.summaryReservation}>
              <div className={styles.summaryDate}>
                <div className={styles.dayName}>
                  {new Date(reservation.date).toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className={styles.dayNumber}>{new Date(reservation.date).getDate()}</div>
              </div>
              <div className={styles.summaryContent}>
                <h4>{reservation.eventName}</h4>
                <p>
                  {reservation.facility} • {formatTime(reservation.startTime)}-{formatTime(reservation.endTime)}
                </p>
                <p className={styles.reservantName}>
                  <IonIcon icon={personOutline} />
                  {reservation.reservantName}
                </p>
              </div>
              <span className={`${styles.statusBadge} ${getStatusClass(reservation.status, styles)}`}>
                {reservation.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.summaryCard}>
        <h3>
          <IonIcon icon={statsChartOutline} />
          Next Month's Reservations
        </h3>
        <div className={`${styles.reservationsList} ${styles.reservationsListMonth}`}>
          {getNextMonthReservations(reservations).length > 0 ? (
            getNextMonthReservations(reservations).map((reservation) => (
              <div key={reservation.id} className={styles.summaryReservation}>
                <div className={styles.summaryDate}>
                  <div className={styles.monthName}>
                    {new Date(reservation.date).toLocaleDateString("en-US", { month: "short" })}
                  </div>
                  <div className={styles.dayNumber}>{new Date(reservation.date).getDate()}</div>
                </div>
                <div className={styles.summaryContent}>
                  <h4>{reservation.eventName}</h4>
                  <p>
                    {reservation.facility} • {formatTime(reservation.startTime)}-{formatTime(reservation.endTime)}
                  </p>
                  <p className={styles.reservantName}>
                    <IonIcon icon={personOutline} />
                    {reservation.reservantName}
                  </p>
                </div>
                <span className={`${styles.statusBadge} ${getStatusClass(reservation.status, styles)}`}>
                  {reservation.status}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.noReservations}>
              <IonIcon icon={calendarClearOutline} className={styles.noReservationsIcon} />
              <p>No reservations next month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SummaryView
