import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../utils/AuthContext"
import {
  personOutline,
  lockClosedOutline,
  logInOutline,
  shieldCheckmarkOutline,
  eyeOutline,
  eyeOffOutline,
} from "ionicons/icons"
import { IonIcon } from "@ionic/react"
import styles from "./Login.module.css"
import backgroundImage from "../../../assets/img-bg.webp"

function Login() {
  const [adminId, setAdminId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic validation
    if (adminId.length !== 6 || !/^\d+$/.test(adminId)) {
      setError("Admin ID must be a 6-digit number")
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Password is required")
      setIsLoading(false)
      return
    }

    try {
      // ✅ Use the proper login method from AuthContext
      const { data, error: loginError } = await login(adminId, password)

      if (loginError) {
        console.error("Login error:", loginError)
        setError(loginError.message || "Invalid Admin ID or password")
        setIsLoading(false)
        return
      }

      if (data) {
        console.log("Login successful:", data)
        // ✅ Navigate to dashboard (the AuthContext will handle the user state)
        // Your App.jsx will automatically redirect "/" to "/overview"
        navigate("/")
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <>
      <img src={backgroundImage} alt="" className={styles.backgroundImage} />
      <div className={styles.container}>
        <div className={styles.authContainer}>
          <div className={styles.loginCard}>
            <div className={styles.header}>
              <div className={styles.logoContainer}>
                <IonIcon icon={shieldCheckmarkOutline} className={styles.logoIcon} />
              </div>
              <h1>HOA Admin Portal</h1>
              <p>Admin System Application</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <IonIcon icon={personOutline} className={styles.inputIcon} />
                  <input
                    type="text"
                    id="adminId"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Admin ID"
                    maxLength="6"
                    required
                    className={styles.inputWithIcon}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <IonIcon icon={lockClosedOutline} className={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className={styles.inputWithToggle}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                  </button>
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" className={styles.loginBtn} disabled={isLoading}>
                <IonIcon icon={logInOutline} className={styles.buttonIcon} />
                {isLoading ? "Accessing..." : "ACCESS DASHBOARD"}
              </button>
            </form>
          </div>

          <div className={styles.welcomePanel}>
            <h2 className={styles.welcomeTitle}>New Administrator?</h2>
            <p className={styles.welcomeText}>
              Register your HOA admin account to manage community operations and resident services
            </p>
            <button className={styles.welcomeBtn} onClick={() => navigate("/register")} disabled={isLoading}>
              REGISTER ADMIN
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login