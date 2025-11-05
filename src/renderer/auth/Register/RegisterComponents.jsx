import React from "react"
import { IonIcon } from "@ionic/react"
import {
  person,
  lockClosed,
  eye,
  eyeOff,
} from "ionicons/icons"
import styles from "./Register.module.css"

export const AdminIdDisplay = ({ generatedId }) => (
  <div className={styles.adminIdDisplay}>
    <label>Generated Admin ID</label>
    <div className={styles.adminId}>{generatedId}</div>
    <p className={styles.adminIdNote}>
      Save this Admin ID - you'll need it to log into the system
    </p>
  </div>
)

export const PersonalInfoFields = ({ formData, handleChange }) => (
  <div className={styles.nameRow}>
    <div className={styles.inputGroup}>
      <label htmlFor="firstName">First Name</label>
      <div className={styles.inputWrapper}>
        <IonIcon icon={person} className={styles.inputIcon} />
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Your first name"
          required
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
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Your last name"
          required
        />
      </div>
    </div>
  </div>
)

export const PasswordFields = ({
  formData,
  handleChange,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
}) => (
  <div className={styles.passwordRow}>
    <div className={styles.inputGroup}>
      <label htmlFor="password">Create Password</label>
      <div className={styles.inputWrapper}>
        <IonIcon icon={lockClosed} className={styles.inputIcon} />
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create Password"
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
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
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
)