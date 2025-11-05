import { useMemo, useCallback } from "react"
import styles from "../styles/PublishOptions.module.css"

// Move options array outside component to prevent recreation
const OPTIONS = [
  { value: "now", label: "Publish Now" },
  { value: "schedule", label: "Schedule Publication" },
  { value: "draft", label: "Save as Draft" }
]

const PublishOptions = ({ 
  publishOption, 
  onChange, 
  disabled = false 
}) => {
  // Memoize change handler
  const handleChange = useCallback((e) => {
    onChange("publishOption", e.target.value)
  }, [onChange])

  // Memoize rendered options to prevent re-mapping on every render
  const renderedOptions = useMemo(() => (
    OPTIONS.map((option) => (
      <label key={option.value} className={styles.radioLabel}>
        <input
          type="radio"
          value={option.value}
          checked={publishOption === option.value}
          onChange={handleChange}
          disabled={disabled}
        />
        {option.label}
      </label>
    ))
  ), [publishOption, handleChange, disabled])

  return (
    <div className={styles.radioGroup}>
      {renderedOptions}
    </div>
  )
}

export default PublishOptions