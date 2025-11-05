import { IonIcon } from "@ionic/react"
import { basketball, business, calendarClear, arrowForward } from "ionicons/icons"
import { useNavigate } from "react-router-dom"
import styles from "../styles/TodaySchedule.module.css"

function TodaySchedule({ schedule }) {
  const navigate = useNavigate()
  const hasCoveredCourtSchedule = schedule.coveredCourt.length > 0
  const hasMultiPurposeSchedule = schedule.multiPurpose.length > 0
  const hasAnySchedule = hasCoveredCourtSchedule || hasMultiPurposeSchedule

  // Limit to 3 items per facility
  const limitedCoveredCourt = schedule.coveredCourt.slice(0, 3)
  const limitedMultiPurpose = schedule.multiPurpose.slice(0, 3)

  return (
    <div className={styles.contentBox}>
      <div className={styles.scheduleHeader}>
        <h3>Today's Reserved Schedule</h3>
        <button 
          className={styles.viewScheduleBtn}
          onClick={() => navigate('/facilities')}
        >
          View Schedule
          <IonIcon icon={arrowForward} />
        </button>
      </div>
      
      {!hasAnySchedule ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <IonIcon icon={calendarClear} />
          </div>
          <div className={styles.emptyTitle}>No Reservations Today</div>
          <p className={styles.emptyText}>
            There are no facility reservations scheduled for today.
          </p>
        </div>
      ) : (
        <div className={styles.scheduleGrid}>
          <div className={styles.scheduleSection}>
            <h4>
              <IonIcon icon={basketball} /> Covered Court
            </h4>
            {hasCoveredCourtSchedule ? (
              <div className={styles.scheduleList}>
                {limitedCoveredCourt.map((item, index) => (
                  <div key={index} className={styles.scheduleItem}>
                    <div className={styles.scheduleName}>{item.name}</div>
                    <div className={styles.schedulePerson}>{item.person}</div>
                    <div className={styles.scheduleTime}>{item.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noSchedule}>
                No reservations for today
              </div>
            )}
          </div>
          
          <div className={styles.scheduleSection}>
            <h4>
              <IonIcon icon={business} /> Multi-purpose Hall
            </h4>
            {hasMultiPurposeSchedule ? (
              <div className={styles.scheduleList}>
                {limitedMultiPurpose.map((item, index) => (
                  <div key={index} className={styles.scheduleItem}>
                    <div className={styles.scheduleName}>{item.name}</div>
                    <div className={styles.schedulePerson}>{item.person}</div>
                    <div className={styles.scheduleTime}>{item.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noSchedule}>
                No reservations for today
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TodaySchedule