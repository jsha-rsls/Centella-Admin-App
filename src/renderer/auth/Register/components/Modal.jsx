import { IonIcon } from "@ionic/react"
import { checkmarkCircle, copy, logIn } from "ionicons/icons"
import { useState } from "react"
import styles from "./Modal.module.css"

function Modal({ isOpen, title, message, adminId, countdown, onRedirect, children }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    if (adminId) {
      navigator.clipboard.writeText(adminId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.successIcon}>
          <IonIcon icon={checkmarkCircle} />
        </div>
        
        {title && <h2 className={styles.title}>{title}</h2>}
        {message && <p className={styles.message}>{message}</p>}
        
        {adminId && (
          <div className={styles.adminIdSection}>
            <p className={styles.adminIdLabel}>Your Admin ID</p>
            <div className={styles.adminIdBox}>
              <span className={styles.adminIdValue}>{adminId}</span>
              <button 
                className={styles.copyButton} 
                onClick={handleCopy}
                title="Copy Admin ID"
              >
                <IonIcon icon={copy} />
                {copied && <span className={styles.copiedText}>Copied!</span>}
              </button>
            </div>
            <p className={styles.adminIdNote}>
              💡 Save this ID! You'll need it to login.
            </p>
          </div>
        )}

        {children && <div className={styles.content}>{children}</div>}

        {countdown !== undefined && (
          <div className={styles.actions}>
            <button className={styles.redirectButton} onClick={onRedirect}>
              <IonIcon icon={logIn} />
              Go to Login Now
            </button>
            <p className={styles.countdown}>
              Auto-redirecting in {countdown} seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal