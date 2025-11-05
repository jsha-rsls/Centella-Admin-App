// Form validation utility
export const validateForm = (formData) => {
  console.log("🔍 Validating formData:", formData)

  // Required fields
  const requiredFields = [
    { field: formData.firstName, name: 'First name' },
    { field: formData.lastName, name: 'Last name' },
    { field: formData.position, name: 'Position' },
    { field: formData.email, name: 'Email' },
    { field: formData.password, name: 'Password' },
    { field: formData.confirmPassword, name: 'Password confirmation' }
  ]

  for (const { field, name } of requiredFields) {
    if (!field?.trim()) {
      console.warn(`❌ Validation failed: ${name} is required`)
      return `${name} is required`
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email.trim())) {
    console.warn("❌ Validation failed: Invalid email")
    return "Please enter a valid email address"
  }

  if (formData.password !== formData.confirmPassword) {
    console.warn("❌ Validation failed: Passwords do not match")
    return "Passwords do not match"
  }

  const passwordError = validatePassword(formData.password)
  if (passwordError) {
    console.warn("❌ Validation failed:", passwordError)
    return passwordError
  }

  console.log("✅ All validations passed")
  return null
}


// Enhanced password validation
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required"
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long"
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter"
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter"
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number"
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character"
  }

  return null // Password is valid
}

// Check password strength for UI feedback
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'No password', color: '#e74c3c' }

  let score = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  score = Object.values(checks).filter(Boolean).length

  const strengthLevels = [
    { score: 0, label: 'Very Weak', color: '#e74c3c' },
    { score: 1, label: 'Weak', color: '#e67e22' },
    { score: 2, label: 'Fair', color: '#f39c12' },
    { score: 3, label: 'Good', color: '#f1c40f' },
    { score: 4, label: 'Strong', color: '#27ae60' },
    { score: 5, label: 'Very Strong', color: '#2ecc71' }
  ]

  return strengthLevels[score] || strengthLevels[0]
}

// Validate individual form fields
export const validateField = (name, value, formData = {}) => {
  switch (name) {
    case 'firstName':
    case 'lastName':
      if (!value?.trim()) {
        return `${name === 'firstName' ? 'First' : 'Last'} name is required`
      }
      if (value.trim().length < 2) {
        return `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`
      }
      return null

    case 'position':
      if (!value?.trim()) {
        return 'Position is required'
      }
      return null

    case 'email':
      if (!value?.trim()) {
        return 'Email is required'
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value.trim())) {
        return 'Please enter a valid email address'
      }
      return null

    case 'verificationCode':
      if (!value?.trim()) {
        return 'Verification code is required'
      }
      if (value.trim().length !== 6) {
        return 'Verification code must be 6 digits'
      }
      if (!/^\d{6}$/.test(value.trim())) {
        return 'Verification code must contain only numbers'
      }
      return null

    case 'password':
      return validatePassword(value)

    case 'confirmPassword':
      if (!value?.trim()) {
        return 'Please confirm your password'
      }
      if (value !== formData.password) {
        return 'Passwords do not match'
      }
      return null

    default:
      return null
  }
}

// Error messages constants
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORD_MISSING_UPPERCASE: "Password must contain at least one uppercase letter",
  PASSWORD_MISSING_LOWERCASE: "Password must contain at least one lowercase letter", 
  PASSWORD_MISSING_NUMBER: "Password must contain at least one number",
  PASSWORD_MISSING_SPECIAL: "Password must contain at least one special character",
  INVALID_VERIFICATION_CODE: "Verification code must be 6 digits",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  EMAIL_ALREADY_EXISTS: "An admin account with this email already exists",
  NETWORK_ERROR: "Network error. Please check your connection and try again."
}