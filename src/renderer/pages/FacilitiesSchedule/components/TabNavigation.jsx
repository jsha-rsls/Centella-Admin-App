import { IonIcon } from "@ionic/react"
import {
  calendarOutline,
  statsChartOutline,
  listOutline,
  funnelOutline,
  gridOutline,
  reorderFourOutline,
} from "ionicons/icons"

function TabNavigation({
  styles,
  activeTab,
  setActiveTab,
  showFilterButton,
  onFilterToggle,
  isFilterOpen,
  viewMode,
  setViewMode,
}) {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabsWrapper}>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`${styles.tab} ${activeTab === "calendar" ? styles.tabActive : ""}`}
        >
          <IonIcon icon={calendarOutline} /> Calendar View
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`${styles.tab} ${activeTab === "summary" ? styles.tabActive : ""}`}
        >
          <IonIcon icon={statsChartOutline} /> Summary View
        </button>
        <button
          onClick={() => setActiveTab("reservations")}
          className={`${styles.tab} ${activeTab === "reservations" ? styles.tabActive : ""}`}
        >
          <IonIcon icon={listOutline} /> All Reservations
        </button>
      </div>

      {showFilterButton && (
        <div className={styles.viewControls}>
          <button
            onClick={onFilterToggle}
            className={`${styles.filterToggleButton} ${isFilterOpen ? styles.filterToggleActive : ""}`}
            title={isFilterOpen ? "Hide Filters" : "Show Filters"}
          >
            <IonIcon icon={funnelOutline} />
            <span>Filters</span>
          </button>

          <div className={styles.viewToggleGroup}>
            <button
              onClick={() => setViewMode("list")}
              className={`${styles.viewToggleButton} ${viewMode === "list" ? styles.viewToggleActive : ""}`}
              title="List View"
            >
              <IonIcon icon={reorderFourOutline} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`${styles.viewToggleButton} ${viewMode === "card" ? styles.viewToggleActive : ""}`}
              title="Card View"
            >
              <IonIcon icon={gridOutline} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TabNavigation
