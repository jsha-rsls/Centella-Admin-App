import { IonIcon } from "@ionic/react"
import { person, briefcase, arrowForward, arrowBack, chevronDown } from "ionicons/icons"
import { useState, useCallback, useMemo } from "react"
import styles from "./stepStyles/Step1.module.css"

function Step1({ formData, handleChange, nextStep, navigate, error }) {
  const [otherPosition, setOtherPosition] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const hoaPositions = useMemo(() => [
    "President",
    "Vice President", 
    "Secretary",
    "Treasurer",
    "Board Member",
    "Property Manager",
    "Other"
  ], [])

  const isOtherSelected = formData.position === "Other" || 
    (formData.position && !hoaPositions.includes(formData.position))

  const handlePositionChange = useCallback((e) => {
    const value = e.target.value
    handleChange(e)
    
    if (value !== "Other") {
      setOtherPosition("")
    }
  }, [handleChange])

  const handleOtherPositionChange = useCallback((e) => {
    const value = e.target.value
    setOtherPosition(value)
    
    // Create synthetic event for the main position field
    const syntheticEvent = {
      target: {
        name: "position",
        value: value
      }
    }
    handleChange(syntheticEvent)
  }, [handleChange])

  const handleDropdownFocus = useCallback(() => {
    setIsDropdownOpen(true)
  }, [])

  const handleDropdownBlur = useCallback(() => {
    // Small delay to allow for option selection
    setTimeout(() => setIsDropdownOpen(false), 150)
  }, [])

  const validateAndProceed = useCallback((e) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = [
      { field: formData.firstName, name: 'First Name' },
      { field: formData.lastName, name: 'Last Name' },
      { field: formData.position, name: 'Position' }
    ]

    for (const { field, name } of requiredFields) {
      if (!field?.trim()) {
        console.warn(`${name} is required`)
        return
      }
    }
    
    nextStep()
  }, [formData.firstName, formData.lastName, formData.position, nextStep])

  const getDropdownIconClass = useMemo(() => {
    return isDropdownOpen 
      ? `${styles.dropdownIcon} ${styles.dropdownIconOpen}` 
      : styles.dropdownIcon
  }, [isDropdownOpen])

  return (
    <form onSubmit={validateAndProceed} className={styles.form}>
      <div className={styles.nameRow}>
        <div className={styles.inputGroup}>
          <label htmlFor="firstName">First Name</label>
          <div className={styles.inputWrapper}>
            <IonIcon icon={person} className={styles.inputIcon} />
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              placeholder="Enter first name"
              required
              autoComplete="given-name"
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="lastName">Last Name</label>
          <div className={styles.inputWrapper}>
            <IonIcon icon={person} className={styles.inputIcon} />
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              placeholder="Enter last name"
              required
              autoComplete="family-name"
            />
          </div>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="position">HOA Position</label>
        <div className={styles.inputWrapper}>
          <IonIcon icon={briefcase} className={styles.inputIcon} />
          <select
            id="position"
            name="position"
            value={isOtherSelected ? "Other" : (formData.position || "")}
            onChange={handlePositionChange}
            onFocus={handleDropdownFocus}
            onBlur={handleDropdownBlur}
            required
            className={styles.selectInput}
            aria-label="Select your HOA position"
          >
            <option value="">Select your position</option>
            {hoaPositions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <IonIcon 
            icon={chevronDown} 
            className={getDropdownIconClass}
            aria-hidden="true"
          />
        </div>
      </div>

      {isOtherSelected && (
        <div className={styles.inputGroup}>
          <label htmlFor="otherPosition">Specify Position</label>
          <div className={styles.inputWrapper}>
            <IonIcon icon={briefcase} className={styles.inputIcon} />
            <input
              type="text"
              id="otherPosition"
              name="otherPosition"
              value={otherPosition}
              onChange={handleOtherPositionChange}
              placeholder="Enter your specific position"
              required
              autoComplete="organization-title"
            />
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className={styles.buttonRow}>
        <button 
          type="button" 
          className={styles.backBtn} 
          onClick={() => navigate("/login")}
          aria-label="Go back to access page"
        >
          <IonIcon icon={arrowBack} />
          Back to Access
        </button>
        <button 
          type="submit" 
          className={styles.nextBtn}
          aria-label="Continue to next step"
        >
          <IonIcon icon={arrowForward} />
          Continue
        </button>
      </div>
    </form>
  )
}

export default Step1