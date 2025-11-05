import { memo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import {
  searchOutline,
  listOutline,
  gridOutline,
  optionsOutline,
} from "ionicons/icons"
import styles from "../styles/SearchAndFilters.module.css"

// Memoized filter select component
const FilterSelect = memo(({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  allLabel 
}) => {
  return (
    <div className={styles.filterGroup}>
      <label htmlFor={id}>{label}:</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={styles.filterSelect}
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label} {option}
          </option>
        ))}
      </select>
    </div>
  )
})

FilterSelect.displayName = 'FilterSelect'

// Memoized view toggle button component
const ViewToggleButton = memo(({ 
  isActive, 
  onClick, 
  icon, 
  title, 
  mode 
}) => {
  const handleClick = useCallback(() => {
    onClick(mode)
  }, [onClick, mode])
  
  return (
    <button
      className={`${styles.viewBtn} ${isActive ? styles.active : ""}`}
      onClick={handleClick}
      title={title}
    >
      <IonIcon icon={icon} />
    </button>
  )
})

ViewToggleButton.displayName = 'ViewToggleButton'

export const SearchAndFilters = memo(({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  filterBlock,
  onBlockFilterChange,
  filterPhase,
  onPhaseFilterChange,
  uniqueBlocks,
  uniquePhases,
}) => {
  return (
    <div className={styles.controls}>
      <div className={styles.leftSection}>
        <div className={styles.searchContainer}>
          <IonIcon icon={searchOutline} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search homeowners..."
            value={searchTerm}
            onChange={onSearchChange}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterSection}>
          <button
            className={`${styles.filterBtn} ${showFilters ? styles.active : ""}`}
            onClick={onToggleFilters}
          >
            <IonIcon icon={optionsOutline} />
            <span>Filter</span>
          </button>

          {showFilters && (
            <div className={styles.filterControls}>
              <FilterSelect
                id="blockFilter"
                label="Block"
                value={filterBlock}
                onChange={onBlockFilterChange}
                options={uniqueBlocks}
                allLabel="All Blocks"
              />

              <FilterSelect
                id="phaseFilter"
                label="Phase"
                value={filterPhase}
                onChange={onPhaseFilterChange}
                options={uniquePhases}
                allLabel="All Phases"
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.viewToggle}>
        <ViewToggleButton
          isActive={viewMode === "table"}
          onClick={onViewModeChange}
          icon={listOutline}
          title="Table View"
          mode="table"
        />
        <ViewToggleButton
          isActive={viewMode === "cards"}
          onClick={onViewModeChange}
          icon={gridOutline}
          title="Card View"
          mode="cards"
        />
      </div>
    </div>
  )
})

SearchAndFilters.displayName = 'SearchAndFilters'