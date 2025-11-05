import { IonIcon } from "@ionic/react"
import { closeOutline } from "ionicons/icons"
import styles from "../styles/FilterModal.module.css"

export function FilterModal({
  isOpen,
  onClose,
  filterStatus,
  onStatusChange,
  filterDateRange,
  onDateRangeChange,
  onReset,
  onApply,
}) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Filter Transactions</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Date Range</label>
            <div className={styles.dateRange}>
              <input
                type="date"
                className={styles.filterInput}
                value={filterDateRange.start}
                onChange={(e) => onDateRangeChange({ ...filterDateRange, start: e.target.value })}
              />
              <span>to</span>
              <input
                type="date"
                className={styles.filterInput}
                value={filterDateRange.end}
                onChange={(e) => onDateRangeChange({ ...filterDateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onReset}>
            Reset
          </button>
          <button className={styles.btnPrimary} onClick={onApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
