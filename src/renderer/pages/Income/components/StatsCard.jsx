import { IonIcon } from "@ionic/react"
import styles from "../styles/StatsCard.module.css"

export function StatsCard({ icon, label, value, description, gradient }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: gradient }}>
        <IonIcon icon={icon} />
      </div>
      <div className={styles.statContent}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statChange}>{description}</span>
      </div>
    </div>
  )
}