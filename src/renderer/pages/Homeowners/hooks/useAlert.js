import { useState, useCallback } from 'react'

export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    onCancel: null
  })

  // Show success alert
  const showSuccess = useCallback((message, title) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        type: 'success',
        title: title || 'Success',
        message,
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: null
      })
    })
  }, [])

  // Show error alert
  const showError = useCallback((message, title) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        type: 'error',
        title: title || 'Error',
        message,
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: null
      })
    })
  }, [])

  // Show warning alert
  const showWarning = useCallback((message, title) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        type: 'warning',
        title: title || 'Warning',
        message,
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: null
      })
    })
  }, [])

  // Show info alert
  const showInfo = useCallback((message, title) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        type: 'info',
        title: title || 'Information',
        message,
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: null
      })
    })
  }, [])

  // Show confirmation dialog
  const showConfirm = useCallback((message, title, options = {}) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        type: 'confirm',
        title: title || 'Confirm Action',
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        showCancel: true,
        onConfirm: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setAlertState(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  return {
    alertState,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  }
}