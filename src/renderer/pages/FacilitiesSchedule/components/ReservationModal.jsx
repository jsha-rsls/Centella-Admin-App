import { IonIcon } from "@ionic/react"
import {
  closeOutline,
  calendarOutline,
  timeOutline,
  locationOutline,
  personOutline,
  homeOutline,
  callOutline,
  mailOutline,
  checkmarkCircleOutline,
} from "ionicons/icons"
import { formatDate, formatTime } from "../utils/dateUtils"
import { getStatusClass } from "../utils/reservationUtils"
import { useEffect, useState } from "react"

function ReservationModal({ styles, selectedReservation, setSelectedReservation }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (selectedReservation) {
      document.addEventListener("keydown", handleEscKey)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
      document.body.style.overflow = "unset"
    }
  }, [selectedReservation])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedReservation(null)
      setIsClosing(false)
    }, 300)
  }

  if (!selectedReservation) return null

  return (
    <div className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`} onClick={handleClose}>
      <div
        className={`${styles.modalContent} ${isClosing ? styles.modalContentClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Event: {selectedReservation.eventName}</h2>
          <button onClick={handleClose} className={styles.closeButton} aria-label="Close modal">
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.reservationInfo}>
            <div className={styles.infoSection}>
              <h4>Event Details</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={locationOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Facility</span>
                  </div>
                  <span className={styles.infoValue}>{selectedReservation.facility}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={calendarOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Date</span>
                  </div>
                  <span className={styles.infoValue}>{formatDate(selectedReservation.date)}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={timeOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Time</span>
                  </div>
                  <span className={styles.infoValue}>
                    {formatTime(selectedReservation.startTime)} - {formatTime(selectedReservation.endTime)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={checkmarkCircleOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Status</span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(selectedReservation.status, styles)}`}>
                    {selectedReservation.status}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h4>Reservant Information</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={personOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Name</span>
                  </div>
                  <span className={styles.infoValue}>{selectedReservation.reservantName}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={homeOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Address</span>
                  </div>
                  <span className={styles.infoValue}>{selectedReservation.address}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={callOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Contact Number</span>
                  </div>
                  <span className={styles.infoValue}>{selectedReservation.contactNumber}</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabelWrapper}>
                    <IonIcon icon={mailOutline} className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Email</span>
                  </div>
                  <span className={styles.infoValue}>{selectedReservation.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationModal
