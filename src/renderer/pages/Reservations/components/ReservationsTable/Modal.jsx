import { memo, useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import styles from "./Modal.module.css"

const Modal = memo(
  ({ isOpen, title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel", isLoading = false, isReject = false }) => {
    const [isEscKeyPressed, setIsEscKeyPressed] = useState(false)

    useEffect(() => {
      const handleEscKey = (event) => {
        if (event.key === "Escape") {
          setIsEscKeyPressed(true)
        }
      }

      document.addEventListener("keydown", handleEscKey)

      return () => {
        document.removeEventListener("keydown", handleEscKey)
      }
    }, [])

    useEffect(() => {
      if (isEscKeyPressed) {
        onCancel()
        setIsEscKeyPressed(false)
      }
    }, [isEscKeyPressed, onCancel])

    if (!isOpen) return null

    return (
      <>
        {/* Backdrop */}
        <div className={styles.backdrop} onClick={onCancel} />

        {/* Modal */}
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{title}</h2>
              <button className={styles.closeBtn} onClick={onCancel} aria-label="Close modal">
                &#10006;
              </button>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              <p className={styles.modalMessage}>{message}</p>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={onCancel} disabled={isLoading}>
                <XCircle size={16} />
                <span>{cancelText}</span>
              </button>
              <button 
                className={isReject ? styles.btnReject : styles.btnConfirm} 
                onClick={onConfirm} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    {isReject ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    <span>{confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  },
)

Modal.displayName = "Modal"

export default Modal