import { useEffect, useMemo, useCallback, memo } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  checkmarkCircleOutline, 
  alertCircleOutline, 
  informationCircleOutline, 
  warningOutline,
  closeOutline 
} from 'ionicons/icons';
import styles from '../styles/Toast.module.css';

// Icon and class mappings moved outside component
const TOAST_CONFIG = {
  success: {
    icon: checkmarkCircleOutline,
    iconClass: styles.toastIconSuccess,
    toastClass: styles.toastSuccess
  },
  error: {
    icon: alertCircleOutline,
    iconClass: styles.toastIconError,
    toastClass: styles.toastError
  },
  warning: {
    icon: warningOutline,
    iconClass: styles.toastIconWarning,
    toastClass: styles.toastWarning
  },
  info: {
    icon: informationCircleOutline,
    iconClass: styles.toastIconInfo,
    toastClass: styles.toastInfo
  }
};

// Toast Component with memo
export const Toast = memo(({ toast, onRemove }) => {
  // Memoize toast config lookup
  const config = useMemo(
    () => TOAST_CONFIG[toast.type] || TOAST_CONFIG.info,
    [toast.type]
  );

  // Memoize toast class name
  const toastClassName = useMemo(
    () => `${styles.toast} ${config.toastClass}`,
    [config.toastClass]
  );

  // Memoize remove handler for this specific toast
  const handleRemove = useCallback(() => {
    onRemove(toast.id);
  }, [onRemove, toast.id]);

  // Auto-dismiss timer
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div className={toastClassName}>
      <div className={styles.toastContent}>
        <IonIcon icon={config.icon} className={config.iconClass} />
        <div className={styles.toastText}>
          <p className={styles.toastTitle}>{toast.title}</p>
          {toast.message && (
            <p className={styles.toastMessage}>{toast.message}</p>
          )}
        </div>
      </div>
      <button
        onClick={handleRemove}
        className={styles.toastCloseButton}
      >
        <IonIcon icon={closeOutline} />
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';

// Toast Container Component with memo
export const ToastContainer = memo(({ toasts, onRemove }) => {
  // Memoize rendered toasts
  const renderedToasts = useMemo(() => (
    toasts.map((toast) => (
      <Toast key={toast.id} toast={toast} onRemove={onRemove} />
    ))
  ), [toasts, onRemove]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {renderedToasts}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';