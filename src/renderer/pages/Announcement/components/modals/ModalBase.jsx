import { useMemo } from "react"
import { IoClose } from "react-icons/io5"
import styles from "../../styles/modals/ModalBase.module.css"

const ModalBase = ({ 
  show, 
  onClose, 
  title, 
  children, 
  footer,
  size = "medium" // "small", "medium", "large"
}) => {
  // Memoize size class name
  const sizeClass = useMemo(() => {
    const capitalizedSize = size.charAt(0).toUpperCase() + size.slice(1)
    return styles[`modal${capitalizedSize}`] || styles.modalMedium
  }, [size])

  // Memoize modal content class name
  const modalContentClass = useMemo(
    () => `${styles.modalContent} ${sizeClass}`,
    [sizeClass]
  )

  // Early return if modal is not shown
  if (!show) return null

  return (
    <div className={styles.modal}>
      <div className={modalContentClass}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <IoClose size={20} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {children}
        </div>
        
        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalBase