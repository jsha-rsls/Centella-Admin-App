import styles from "../styles/PeriodSelector.module.css"

export function PeriodSelector({ selectedPeriod, onPeriodChange }) {
  const periods = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ]

  return (
    <div className={styles.periodSelector}>
      {periods.map((period) => (
        <button
          key={period.value}
          className={`${styles.periodBtn} ${selectedPeriod === period.value ? styles.active : ""}`}
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
