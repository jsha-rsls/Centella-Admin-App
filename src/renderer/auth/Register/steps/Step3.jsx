import { IonIcon } from "@ionic/react"
import { 
  lockClosed, eye, eyeOff, arrowBack, personAdd,
  checkmarkCircle, closeCircle
} from "ionicons/icons"
import styles from "./stepStyles/Step3.module.css"

function Step3({ 
  formData, 
  handleChange, 
  prevStep, 
  handleSubmit, 
  generatedId,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  isLoading,
  error 
}) {
  // define requirements
  const requirements = [
    { label: "8+ characters", valid: formData.password?.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(formData.password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(formData.password) },
    { label: "Number", valid: /\d/.test(formData.password) },
    { label: "Special character", valid: /[!@#$%^&*(),.?\":{}|<>]/.test(formData.password) }
  ]

  return (
    <div className={styles.step3Container}>
      {generatedId && (
        <div className={styles.adminIdDisplay}>
          <div className={styles.adminId}>{generatedId}</div>
          <p className={styles.adminIdNote}>
            This is your unique Admin ID. Please save it securely as you'll need it for login.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.passwordRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Choose Password</label>
            <div className={styles.inputWrapper}>
              <IonIcon icon={lockClosed} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                <IonIcon icon={showPassword ? eyeOff : eye} />
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.inputWrapper}>
              <IonIcon icon={lockClosed} className={styles.inputIcon} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
                placeholder="Confirm"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <IonIcon icon={showConfirmPassword ? eyeOff : eye} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.passwordRequirements}>
          <h4>Password Requirements</h4>
          <div className={styles.requirementsList}>
            {requirements.map((req, idx) => (
              <div key={idx} className={styles.requirementItem}>
                <IonIcon 
                  icon={req.valid ? checkmarkCircle : closeCircle} 
                  className={req.valid ? styles.validIcon : styles.invalidIcon}
                />
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonRow}>
          <button type="button" className={styles.backBtn} onClick={prevStep}>
            <IonIcon icon={arrowBack} />
            Previous
          </button>
          <button type="submit" className={styles.registerBtn} disabled={isLoading}>
            <IonIcon icon={personAdd} />
            {isLoading ? "Creating Admin..." : "CREATE ADMIN"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step3