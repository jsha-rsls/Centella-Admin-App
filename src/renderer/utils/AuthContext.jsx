import { createContext, useContext, useState, useEffect, useRef } from "react"
import { supabase } from "../../utils/supabase"
import { isInRegistrationProcess } from "../services/registrationService"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Initializing...")
  
  // ✅ Use ref to track if user is already logged in
  const isLoggedIn = useRef(false)
  const isInitializing = useRef(true)
  
  // ✅ Debounce refs for Electron alt-tab fix
  const lastEventTime = useRef(0)
  const EVENT_DEBOUNCE_MS = 500 // 500ms debounce

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        setLoadingMessage("Checking your session...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("❌ Session error:", error)
          if (mounted) {
            setUser(null)
            setLoading(false)
            setIsInitialized(true)
            isInitializing.current = false
          }
          return
        }

        if (session?.user) {
          setLoadingMessage("Auto-logging in...")
          await loadUserData(session.user)
          isLoggedIn.current = true
        } else {
          if (mounted) setUser(null)
        }

        if (mounted) {
          setLoading(false)
          setIsInitialized(true)
          isInitializing.current = false
        }
      } catch (error) {
        console.error("❌ Auth init error:", error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          setIsInitialized(true)
          isInitializing.current = false
        }
      }
    }

    const loadUserData = async (authUser) => {
      try {
        const { data: account } = await supabase
          .from("admin_accounts")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle()

        if (mounted) {
          const newUser = { ...authUser, account: account || null }

          // ✅ Only update if something actually changed
          setUser((prev) => {
            if (!prev) return newUser
            if (prev.id !== newUser.id || JSON.stringify(prev.account) !== JSON.stringify(newUser.account)) {
              return newUser
            }
            return prev
          })
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error)
        if (mounted) {
          const newUser = { ...authUser, account: null }
          setUser((prev) => (prev?.id !== newUser.id ? newUser : prev))
        }
      }
    }

    // Listen for auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // ✅ Debounce duplicate SIGNED_IN events (Electron alt-tab fix)
      if (event === 'SIGNED_IN') {
        const now = Date.now()
        if (now - lastEventTime.current < EVENT_DEBOUNCE_MS) {
          console.log("🔇 Debouncing duplicate SIGNED_IN event (alt-tab)")
          return
        }
        lastEventTime.current = now
      }

      switch (event) {
        case "SIGNED_IN":
          // ✅ CRITICAL FIX: Skip if already logged in OR during registration
          if (isLoggedIn.current) {
            console.log("🔇 Skipping duplicate SIGNED_IN event (already logged in)")
            return
          }
          
          if (isInRegistrationProcess()) {
            console.log("⭐️ Skipping SIGNED_IN event during registration")
            return
          }
          
          // Only process legitimate first-time login
          if (session?.user) {
            console.log("✅ User logged in:", session.user.email)
            setLoadingMessage("Signing in...")
            await loadUserData(session.user)
            isLoggedIn.current = true
          }
          break

        case "SIGNED_OUT":
          console.log("🚪 User signed out")
          setUser(null)
          isLoggedIn.current = false
          break

        case "TOKEN_REFRESHED":
          // ✅ Silent refresh - update data without any UI changes
          if (session?.user && isLoggedIn.current) {
            await loadUserData(session.user)
          }
          break
      }
    })

    initAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (adminId, password) => {
    try {
      // Force clear registration flag before login
      const { setRegistrationFlag } = await import("../services/registrationService")
      setRegistrationFlag(false)
      console.log("🔓 Registration flag cleared before login")
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${adminId}@centellahomes.com`,
        password,
      })

      if (error) return { data: null, error }
      console.log("✅ Login successful:", data.user.email)
      return { data: data.user, error: null }
    } catch (error) {
      console.error("❌ Login failed:", error)
      return { data: null, error: { message: error.message || "Login failed" } }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      isLoggedIn.current = false
      console.log("🚪 Logout successful")
      return { error: null }
    } catch (error) {
      console.error("❌ Logout failed:", error)
      return { error }
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    loadingMessage,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}