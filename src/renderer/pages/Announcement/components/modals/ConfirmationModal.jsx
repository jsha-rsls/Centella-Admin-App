import { useMemo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import { 
  closeOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline, 
  warningOutline,
  trashOutline,
  archiveOutline,
  sendOutline
} from "ionicons/icons"

// Icon mapping moved outside component
const ICON_MAP = {
  delete: trashOutline,
  archive: archiveOutline,
  publish: sendOutline,
  success: checkmarkCircleOutline,
  warning: warningOutline,
  default: alertCircleOutline
}

// Color mapping moved outside component
const COLOR_MAP = {
  delete: "#e53e3e",
  archive: "#d69e2e",
  publish: "#3182ce",
  success: "#38a169",
  warning: "#d69e2e",
  default: "#3182ce"
}

function ConfirmationModal({ 
  styles, 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = "default", 
  confirmText = "Confirm", 
  cancelText = "Cancel" 
}) {
  // Memoize icon selection
  const icon = useMemo(() => ICON_MAP[type] || ICON_MAP.default, [type])

  // Memoize color selection
  const iconColor = useMemo(() => COLOR_MAP[type] || COLOR_MAP.default, [type])

  // Memoize icon style object
  const iconStyle = useMemo(() => ({
    color: iconColor,
    fontSize: '32px'
  }), [iconColor])

  // Memoize button class name
  const confirmButtonClassName = useMemo(() => 
    `${styles.submitButton} ${styles[`${type}Button`]}`,
    [styles, type]
  )

  // Memoize modal content class name
  const modalContentClassName = useMemo(() => 
    `${styles.modalContent} ${styles.confirmationModal}`,
    [styles]
  )

  // Memoize event handler to prevent propagation
  const handleModalContentClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  // Early return if not open
  if (!isOpen) return null

  return (
    <div className={styles.modal} onClick={onClose}>
      <div 
        className={modalContentClassName} 
        onClick={handleModalContentClick}
      >
        <div className={styles.modalHeader}>
          <div className={styles.confirmationHeader}>
            <IonIcon 
              icon={icon} 
              style={iconStyle}
            />
            <h2>{title}</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.confirmationMessage}>{message}</p>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={confirmButtonClassName}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal