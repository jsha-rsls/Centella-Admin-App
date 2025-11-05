import { IonIcon } from "@ionic/react"
import { people, basketball, business, cash } from "ionicons/icons"
import styles from "../styles/StatsCards.module.css"

function StatsCards({ stats }) {
  return (
    <div className={styles.summaryBoxes}>
      <div className={styles.summaryBox}>
        <div className={styles.summaryIcon}>
          <IonIcon icon={people} />
        </div>
        <h3 className={styles.summaryLabel}>Total Registered Homeowners</h3>
        <div className={styles.summaryNumber}>{stats.totalHomeowners}</div>
        <div className={styles.summarySubtext}>Verified Homeowners</div>
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryIcon}>
          <IonIcon icon={basketball} />
        </div>
        <h3 className={styles.summaryLabel}>Covered Court</h3>
        <div className={styles.facilityStats}>
          <span className={styles.reserved}>{stats.coveredCourtReserved} Reserved</span>
          <span className={styles.available}>{stats.coveredCourtAvailable} Available</span>
        </div>
        <div className={styles.summarySubtext}>This Month</div>
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryIcon}>
          <IonIcon icon={business} />
        </div>
        <h3 className={styles.summaryLabel}>Multi-purpose Hall</h3>
        <div className={styles.facilityStats}>
          <span className={styles.reserved}>{stats.multiPurposeReserved} Reserved</span>
          <span className={styles.available}>{stats.multiPurposeAvailable} Available</span>
        </div>
        <div className={styles.summarySubtext}>This Month</div>
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryIcon}>
          <IonIcon icon={cash} />
        </div>
        <h3 className={styles.summaryLabel}>Total Monthly Income</h3>
        <div className={styles.summaryNumber}>₱{stats.monthlyIncome.toLocaleString()}</div>
        <div className={styles.summarySubtext}>This Month</div>
      </div>
    </div>
  )
}

export default StatsCards