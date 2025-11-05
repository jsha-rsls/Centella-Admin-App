import { useMemo, useCallback } from "react"
import { formatScheduledDateTime, getTodayDateString } from "../utils/dateUtils"
import styles from "../styles/ScheduleSection.module.css"

// SVG icon components moved outside to prevent recreation
const ClockIcon = () => (
  <svg 
    className={styles.scheduleIcon}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={1.5} 
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
)

const InfoIcon = () => (
  <svg 
    className={styles.previewIcon}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
)

const ScheduleSection = ({ 
  scheduledDate, 
  scheduledTime, 
  onChange, 
  errors = {}, 
  disabled = false 
}) => {
  // Memoize minimum date value (typically today's date)
  const minDate = useMemo(() => getTodayDateString(), [])

  // Memoize event handlers
  const handleDateChange = useCallback((e) => {
    onChange("scheduledDate", e.target.value)
  }, [onChange])

  const handleTimeChange = useCallback((e) => {
    onChange("scheduledTime", e.target.value)
  }, [onChange])

  // Memoize formatted date time display
  const formattedDateTime = useMemo(() => {
    if (!scheduledDate || !scheduledTime) return null
    return formatScheduledDateTime(scheduledDate, scheduledTime)
  }, [scheduledDate, scheduledTime])

  // Memoize whether to show preview
  const showPreview = useMemo(
    () => !!(scheduledDate && scheduledTime),
    [scheduledDate, scheduledTime]
  )

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.scheduleInfo}>
        <ClockIcon />
        <span>Choose when to publish your announcement</span>
      </div>
      
      <div className={styles.dateTimeRow}>
        <div className={styles.dateGroup}>
          <label>Date</label>
          <input
            type="date"
            value={scheduledDate}
            onChange={handleDateChange}
            className={styles.dateInput}
            disabled={disabled}
            min={minDate}
          />
          {errors.scheduledDate && (
            <span className={styles.error}>
              {errors.scheduledDate}
            </span>
          )}
        </div>
        
        <div className={styles.timeGroup}>
          <label>Time</label>
          <input
            type="time"
            value={scheduledTime}
            onChange={handleTimeChange}
            className={styles.timeInput}
            disabled={disabled}
          />
          {errors.scheduledTime && (
            <span className={styles.error}>
              {errors.scheduledTime}
            </span>
          )}
        </div>
      </div>
      
      {showPreview && (
        <div className={styles.schedulePreview}>
          <InfoIcon />
          <span>Will be published on: {formattedDateTime}</span>
        </div>
      )}
    </div>
  )
}

export default ScheduleSection