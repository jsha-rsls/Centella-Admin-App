import { IonIcon } from "@ionic/react"
import { mail, keypad, arrowForward, arrowBack, send, checkmarkCircle, closeCircle } from "ionicons/icons"
import { useState, useEffect } from "react"
import styles from "./stepStyles/Step2.module.css"
import { sendAdminVerificationCode, verifyAdminCode } from "../../../services/verificationService"
import { checkEmailExists } from "../../../services/registrationService"

function Step2({ formData, handleChange, nextStep, prevStep, error }) {
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [localError, setLocalError] = useState("")
  
  // Email validation states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null) // 'available' | 'taken' | null

  // Auto-check email availability when user types
  useEffect(() => {
    const checkEmail = async () => {
      const email = formData.email?.trim()
      
      // Reset states if email is empty or invalid
      if (!email || !email.includes("@") || !email.includes(".")) {
        setEmailStatus(null)
        return
      }

      setIsCheckingEmail(true)
      setLocalError("")

      try {
        const { exists, error } = await checkEmailExists(email)
        
        if (error) {
          console.error("Error checking email:", error)
          setLocalError("Error validating email. Please try again.")
          setEmailStatus(null)
        } else if (exists) {
          setEmailStatus('taken')
          setLocalError("An admin account with this email already exists")
        } else {
          setEmailStatus('available')
          setLocalError("")
        }
      } catch (error) {
        console.error("Email validation error:", error)
        setLocalError("Error validating email. Please try again.")
        setEmailStatus(null)
      } finally {
        setIsCheckingEmail(false)
      }
    }

    // Debounce email check
    const debounceTimer = setTimeout(() => {
      checkEmail()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [formData.email])

  // Auto-verify code when 6 digits are entered
  useEffect(() => {
    const autoVerify = async () => {
      const code = formData.verificationCode?.trim()
      
      // Only auto-verify if code is exactly 6 digits and code was sent
      if (!isCodeSent || isVerified || !code || code.length !== 6) {
        return
      }

      setIsVerifying(true)
      setLocalError("")

      // Call the actual verification service
      const result = await verifyAdminCode(formData.email.trim(), code)
      
      if (result.success) {
        setIsVerified(true)
        setIsVerifying(false)
        setLocalError("")
      } else {
        setLocalError(result.message || "Invalid verification code. Please try again.")
        setIsVerifying(false)
      }
    }

    // Small delay to avoid too many API calls while typing
    const debounceTimer = setTimeout(() => {
      autoVerify()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [formData.verificationCode, isCodeSent, isVerified, formData.email])

  const handleSendCode = async () => {
    if (!formData.email?.trim()) {
      setLocalError("Please enter your email address")
      return
    }

    if (emailStatus !== 'available') {
      setLocalError("Please use a valid and available email address")
      return
    }

    setIsSending(true)
    setLocalError("")
    
    // Call the actual verification service
    const result = await sendAdminVerificationCode(formData.email.trim())
    
    if (result.success) {
      setIsCodeSent(true)
      setIsSending(false)
      setCountdown(60)
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setLocalError(result.message || "Failed to send verification code. Please try again.")
      setIsSending(false)
    }
  }



  const handleNext = (e) => {
    e.preventDefault()
    
    if (!formData.email?.trim()) {
      setLocalError("Please enter your email address")
      return
    }
    if (emailStatus !== 'available') {
      setLocalError("Please use a valid and available email address")
      return
    }
    if (!isVerified) {
      setLocalError("Please verify your email first")
      return
    }
    
    nextStep()
  }

  const isEmailValid = formData.email?.includes("@") && formData.email?.includes(".")
  const canSendCode = isEmailValid && emailStatus === 'available' && !isCheckingEmail

  return (
    <form onSubmit={handleNext} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="email">Email Address</label>
        <div className={styles.inputWrapper}>
          <IonIcon icon={mail} className={styles.inputIcon} />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ""}
            onChange={(e) => {
              handleChange(e)
              setLocalError("")
              setIsCodeSent(false)
              setIsVerified(false)
            }}
            placeholder="Enter your email address"
            required
            disabled={isCodeSent}
          />
          {isCheckingEmail && (
            <div className={styles.checkingSpinner}></div>
          )}
          {!isCheckingEmail && emailStatus === 'available' && (
            <IonIcon icon={checkmarkCircle} className={styles.statusIconAvailable} />
          )}
          {!isCheckingEmail && emailStatus === 'taken' && (
            <IonIcon icon={closeCircle} className={styles.statusIconTaken} />
          )}
        </div>
        {!isCheckingEmail && emailStatus === 'available' && (
          <div className={styles.emailAvailable}>
            ✓ Email is available
          </div>
        )}
      </div>

      <div className={styles.verificationSection}>
        <div className={styles.inputGroup}>
          <label htmlFor="verificationCode">Verification Code</label>
          <div className={styles.codeInputWrapper}>
            <div className={styles.inputWrapper}>
              <IonIcon icon={keypad} className={styles.inputIcon} />
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode || ""}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '')
                  handleChange({ target: { name: 'verificationCode', value } })
                  setLocalError("")
                }}
                placeholder="Enter 6-digit code"
                maxLength="6"
                disabled={!isCodeSent || isVerified}
                required
              />
              {isVerifying && (
                <div className={styles.checkingSpinner}></div>
              )}
              {isVerified && (
                <IonIcon icon={checkmarkCircle} className={styles.statusIconAvailable} />
              )}
            </div>
            
            {!isCodeSent ? (
              <button
                type="button"
                className={`${styles.sendBtn} ${!canSendCode || countdown > 0 ? styles.disabled : ''}`}
                onClick={handleSendCode}
                disabled={!canSendCode || isSending}
              >
                {isSending ? (
                  <>
                    <div className={styles.spinner}></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <IonIcon icon={send} />
                    Send Code
                  </>
                )}
              </button>
            ) : isVerified ? (
              <button
                type="button"
                className={`${styles.sendBtn} ${styles.verified}`}
                disabled
              >
                <IonIcon icon={checkmarkCircle} />
                Verified
              </button>
            ) : (
              <button
                type="button"
                className={`${styles.sendBtn} ${styles.disabled}`}
                disabled
              >
                {isVerifying ? (
                  <>
                    <div className={styles.spinner}></div>
                    Verifying...
                  </>
                ) : (
                  <>Auto-verifying...</>
                )}
              </button>
            )}
          </div>
        </div>

        {countdown > 0 && !isVerified && (
          <div className={styles.countdownText}>
            Resend code in {countdown}s
          </div>
        )}

        {countdown === 0 && isCodeSent && !isVerified && (
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleSendCode}
            disabled={isSending}
          >
            Resend Code
          </button>
        )}

        {isCodeSent && !isVerified && (
          <div className={styles.codeNote}>
            We sent a 6-digit verification code to your email. Please check your inbox and spam folder.
          </div>
        )}

        {isVerified && (
          <div className={styles.successMessage}>
            ✓ Email verified successfully!
          </div>
        )}

        {localError && (
          <div className={styles.errorMessage}>
            {localError}
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.buttonRow}>
        <button type="button" className={styles.backBtn} onClick={prevStep}>
          <IonIcon icon={arrowBack} />
          Previous
        </button>
        <button 
          type="submit" 
          className={`${styles.nextBtn} ${!isVerified ? styles.disabled : ''}`}
          disabled={!isVerified}
        >
          <IonIcon icon={arrowForward} />
          Continue
        </button>
      </div>
    </form>
  )
}

export default Step2