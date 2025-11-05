import { useState, useCallback, useMemo } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  // Memoize addToast function
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 4000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  // Memoize removeToast function
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Memoize type-specific toast functions
  const showSuccess = useCallback((title, message) => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((title, message) => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const showWarning = useCallback((title, message) => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const showInfo = useCallback((title, message) => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  // Memoize returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }), [toasts, addToast, removeToast, showSuccess, showError, showWarning, showInfo]);
};