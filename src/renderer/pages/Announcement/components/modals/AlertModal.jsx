import { useMemo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import { 
  closeOutline, 
  alertCircleOutline,
  warningOutline,
  informationCircleOutline
} from "ionicons/icons"
import styles from "../../styles/modals/AlertModal.module.css"

// Icon and color mappings
const ALERT_CONFIG = {
  warning: {
    icon: warningOutline,
    color: "#d69e2e"
  },
  danger: {
    icon: alertCircleOutline,
    color: "#e53e3e"
  },
  info: {
    icon: informationCircleOutline,
    color: "#3182ce"
  }
}

function AlertModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Alert", 
  message, 
  type = "warning", // "warning", "danger", "info"
  confirmText = "OK", 
  cancelText = "Cancel",
  showCancel = true // Show/hide cancel button
}) {
  // Memoize alert config
  const config = useMemo(
    () => ALERT_CONFIG[type] || ALERT_CONFIG.warning,
    [type]
  );

  // Memoize icon style
  const iconStyle = useMemo(() => ({
    color: config.color,
    fontSize: '48px'
  }), [config.color]);

  // Memoize button class for confirm button
  const confirmButtonClass = useMemo(
    () => `${styles.confirmButton} ${styles[`${type}Button`]}`,
    [type]
  );

  // Memoize event handlers
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  }, [onConfirm, onClose]);

  const handleModalContentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal} onClick={handleModalContentClick}>
        <button onClick={onClose} className={styles.closeButton}>
          <IonIcon icon={closeOutline} />
        </button>

        <div className={styles.iconContainer}>
          <IonIcon 
            icon={config.icon} 
            style={iconStyle}
          />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.actions}>
          {showCancel && (
            <button onClick={onClose} className={styles.cancelButton}>
              {cancelText}
            </button>
          )}
          <button onClick={handleConfirm} className={confirmButtonClass}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal