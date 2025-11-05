import { IonIcon } from "@ionic/react"
import { shieldCheckmark } from "ionicons/icons"
import { useState } from "react"
import { useRegistration } from "./useRegistration"
import Step1 from "./steps/Step1"
import Step2 from "./steps/Step2"
import Step3 from "./steps/Step3"
import styles from "./Register.module.css"
import Modal from "./components/Modal"

function Register() {
  const [currentStep, setCurrentStep] = useState(1)
  const {
    formData,
    error,
    generatedId,
    showPassword,
    showConfirmPassword,
    isLoading,
    isModalOpen,
    countdown,
    handleChange,
    handleSubmit,
    handleRedirectNow,
    navigate,
    setShowPassword,
    setShowConfirmPassword,
  } = useRegistration()

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            navigate={navigate}
            error={error}
          />
        )
      case 2:
        return (
          <Step2
            formData={formData}
            handleChange={handleChange}
            nextStep={nextStep}
            prevStep={prevStep}
            error={error}
          />
        )
      case 3:
        return (
          <Step3
            formData={formData}
            handleChange={handleChange}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            generatedId={generatedId}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            setShowPassword={setShowPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            isLoading={isLoading}
            error={error}
          />
        )
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information"
      case 2:
        return "Email Verification"
      case 3:
        return "Account Security"
      default:
        return "Create Account"
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.authContainer}>
        <div className={styles.welcomePanel}>
          <h2 className={styles.welcomeTitle}>Already Registered?</h2>
          <p className={styles.welcomeText}>
            Access your HOA admin dashboard to continue managing community affairs and resident requests
          </p>
          <button className={styles.welcomeBtn} onClick={() => navigate("/login")}>
            ACCESS DASHBOARD
          </button>
        </div>

        <div className={styles.registerCard}>
          <div className={styles.header}>
            <IonIcon icon={shieldCheckmark} className={styles.headerIcon} />
            <h1>{getStepTitle()}</h1>
            <p>Centella Homes Connect - Step {currentStep} of 3</p>
          </div>

          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>1</div>
            <div className={`${styles.stepLine} ${currentStep > 1 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>2</div>
            <div className={`${styles.stepLine} ${currentStep > 2 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>3</div>
          </div>

          {renderStep()}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        title="Account Created Successfully!" 
        message="Your admin account has been created. Please save your Admin ID to login."
        adminId={generatedId}
        countdown={countdown}
        onRedirect={handleRedirectNow}
      />
    </div>
  )
}

export default Register