import { IonIcon } from "@ionic/react"
import { filterOutline, downloadOutline } from "ionicons/icons"
import styles from "../styles/Header.module.css"

export function Header({ onFilterClick, onExportClick }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.pageTitle}>Income Tracker</h1>
        <p className={styles.pageSubtitle}>Monitor and manage HOA financial income from facility reservations</p>
      </div>
      <div className={styles.headerActions}>
        <button className={styles.btnSecondary} onClick={onFilterClick}>
          <IonIcon icon={filterOutline} />
          Filter
        </button>
        <button className={styles.btnSecondary} onClick={onExportClick}>
          <IonIcon icon={downloadOutline} />
          Export
        </button>
      </div>
    </div>
  )
}
