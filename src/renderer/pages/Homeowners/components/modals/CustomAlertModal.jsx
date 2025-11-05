import { memo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import { 
  checkmarkCircleOutline, 
  closeCircleOutline, 
  warningOutline,
  informationCircleOutline 
} from "ionicons/icons"
import styles from "../../styles/modals/CustomAlertModal.module.css"

const ALERT_TYPES = {
  success: {
    icon: checkmarkCircleOutline,
    color: '#059669',
    title: 'Success'
  },
  error: {
    icon: closeCircleOutline,
    color: '#DC2626',
    title: 'Error'
  },
  warning: {
    icon: warningOutline,
    color: '#F59E0B',
    title: 'Warning'
  },
  info: {
    icon: informationCircleOutline,
    color: '#3B82F6',
    title: 'Information'
  },
  confirm: {
    icon: warningOutline,
    color: '#F59E0B',
    title: 'Confirm Action'
  }
}

export const CustomAlertModal = memo(({ 
  isOpen, 
  type = 'info', 
  title,
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm?.()
  }, [onConfirm])

  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  const handleOverlayClick = useCallback(() => {
    if (showCancel) {
      onCancel?.()
    }
  }, [showCancel, onCancel])

  const handleDialogClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) return null

  const alertConfig = ALERT_TYPES[type] || ALERT_TYPES.info
  const displayTitle = title || alertConfig.title

  return (
    <div className={styles.alertOverlay} onClick={handleOverlayClick}>
      <div className={styles.alertDialog} onClick={handleDialogClick}>
        <div className={styles.alertIcon} style={{ color: alertConfig.color }}>
          <IonIcon icon={alertConfig.icon} />
        </div>
        
        <div className={styles.alertContent}>
          <h3 className={styles.alertTitle}>{displayTitle}</h3>
          <p className={styles.alertMessage}>{message}</p>
        </div>

        <div className={styles.alertActions}>
          {showCancel && (
            <button 
              onClick={handleCancel} 
              className={styles.alertCancelBtn}
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className={`${styles.alertConfirmBtn} ${styles[`alert${type.charAt(0).toUpperCase() + type.slice(1)}Btn`]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
})

CustomAlertModal.displayName = 'CustomAlertModal'