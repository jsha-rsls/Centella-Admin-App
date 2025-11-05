import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../utils/AuthContext"
import styles from "./Sidebar.module.css"
import { useEffect, useState, useMemo, useCallback, memo } from "react"
import { getAdminProfile } from "../../services/adminService"
import reservationAdminService from "../../services/reservationAdminService"
import { getPendingRegistrations } from "../../services/homeownerService"
import notificationSound from '../../../assets/reservationsNotificationSounds/smile.ogg'

// Import Ionicons
import {
  homeOutline,
  statsChartOutline,
  businessOutline,
  peopleOutline,
  megaphoneOutline,
  checkmarkDoneOutline,
  settingsOutline,
  logOutOutline,
  chevronBackOutline,
  chevronForwardOutline,
  analyticsOutline,
  walletOutline,
  cashOutline,
} from "ionicons/icons"
import { IonIcon } from "@ionic/react"

// Memoized MenuItem component
const MenuItem = memo(({ item, isActive, collapsed, onNavigate, onMouseEnter, onMouseLeave }) => {
  const handleClick = useCallback(() => {
    onNavigate(item.path)
  }, [item.path, onNavigate])

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  const handleEnter = useCallback(() => {
    onMouseEnter(item.tooltip)
  }, [item.tooltip, onMouseEnter])

  return (
    <div
      className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Navigate to ${item.label}`}
      aria-current={isActive ? "page" : undefined}
      data-tooltip={item.label}
    >
      <div className={styles.menuContent}>
        <span className={styles.icon}>
          <IonIcon icon={item.icon} />
        </span>
        <span className={styles.label}>{item.label}</span>
        {item.hasNotification && (
          <span className={styles.notificationDot} aria-label="New notifications"></span>
        )}
      </div>
      {isActive && <div className={styles.activeIndicator} aria-hidden="true"></div>}
    </div>
  )
})

MenuItem.displayName = 'MenuItem'

// Memoized MenuGroup component
const MenuGroup = memo(({ group, groupIndex, totalGroups, collapsed, currentPath, onNavigate, onMouseEnter, onMouseLeave }) => {
  return (
    <div className={styles.menuGroup}>
      {!collapsed && (
        <div className={styles.groupHeader}>
          <IonIcon icon={group.icon} />
          {group.title}
        </div>
      )}

      <div className={styles.menuItems}>
        {group.items.map((item) => (
          <MenuItem
            key={item.path}
            item={item}
            isActive={currentPath === item.path}
            collapsed={collapsed}
            onNavigate={onNavigate}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        ))}
      </div>

      {groupIndex < totalGroups - 1 && <div className={styles.groupDivider} aria-hidden="true"></div>}
    </div>
  )
})

MenuGroup.displayName = 'MenuGroup'

function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const [profile, setProfile] = useState(null)
  const [hasNewReservations, setHasNewReservations] = useState(false)
  const [hasNewRegistrations, setHasNewRegistrations] = useState(false)
  const [hoveredItemTooltip, setHoveredItemTooltip] = useState("")
  const [tooltipTimeout, setTooltipTimeout] = useState(null)

  // Fetch profile only once
  useEffect(() => {
    let mounted = true
    
    async function fetchProfile() {
      try {
        const data = await getAdminProfile()
        if (mounted) {
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    
    fetchProfile()
    
    return () => {
      mounted = false
    }
  }, [])

  // Memoized notification sound player - MOVED BEFORE useEffect
  const playNotification = useCallback(() => {
    try {
      const audio = new Audio(notificationSound)
      audio.volume = 0.5
      audio.play().catch(err => console.error('Error playing notification:', err))
    } catch (error) {
      console.error('Error loading notification sound:', error)
    }
  }, [])

  // Optimized reservation listener with cleanup
  useEffect(() => {
    let previousPendingIds = new Set()
    let notificationTimeout = null
    let isInitialized = false

    const checkNewReservations = async (reservations) => {
      // Get current pending reservations
      const pending = reservations.filter(r => r.status === 'pending')
      const currentPendingIds = new Set(pending.map(r => r.id))

      // Only check for new reservations after initialization
      if (isInitialized) {
        // Find new pending reservations (IDs that weren't in previous set)
        const newPendingIds = [...currentPendingIds].filter(id => !previousPendingIds.has(id))
        
        if (newPendingIds.length > 0) {
          console.log('🔔 New pending reservation(s) detected:', newPendingIds)
          playNotification()
          setHasNewReservations(true)
          
          // Clear existing timeout before setting new one
          if (notificationTimeout) {
            clearTimeout(notificationTimeout)
          }
          
          notificationTimeout = setTimeout(() => {
            setHasNewReservations(false)
          }, 10000)
        }
      }

      // Update the set of pending IDs
      previousPendingIds = currentPendingIds
      
      // Mark as initialized after first check
      if (!isInitialized) {
        isInitialized = true
      }
    }

    const loadInitialData = async () => {
      try {
        const result = await reservationAdminService.getAllReservations()
        if (result.success) {
          // Initialize with current pending IDs (don't trigger notification)
          const pending = result.data.filter(r => r.status === 'pending')
          previousPendingIds = new Set(pending.map(r => r.id))
          isInitialized = true
        }
      } catch (error) {
        console.error('Error loading reservations:', error)
      }
    }

    loadInitialData()
    const unsubscribe = reservationAdminService.subscribeToAll(checkNewReservations)

    return () => {
      unsubscribe()
      if (notificationTimeout) {
        clearTimeout(notificationTimeout)
      }
    }
  }, [playNotification])

  // Optimized homeowner registration listener with cleanup
  useEffect(() => {
    let previousPendingIds = new Set()
    let notificationTimeout = null
    let isInitialized = false

    const checkNewRegistrations = async () => {
      try {
        const { data: pendingData } = await getPendingRegistrations()
        
        if (!pendingData) return

        // Get current pending registration IDs
        const currentPendingIds = new Set(pendingData.map(r => r.id))

        // Only check for new registrations after initialization
        if (isInitialized) {
          // Find new pending registrations (IDs that weren't in previous set)
          const newPendingIds = [...currentPendingIds].filter(id => !previousPendingIds.has(id))
          
          if (newPendingIds.length > 0) {
            console.log('🔔 New pending homeowner registration(s) detected:', newPendingIds)
            playNotification()
            setHasNewRegistrations(true)
            
            // Clear existing timeout before setting new one
            if (notificationTimeout) {
              clearTimeout(notificationTimeout)
            }
            
            notificationTimeout = setTimeout(() => {
              setHasNewRegistrations(false)
            }, 10000)
          }
        }

        // Update the set of pending IDs
        previousPendingIds = currentPendingIds
        
        // Mark as initialized after first check
        if (!isInitialized) {
          isInitialized = true
        }
      } catch (error) {
        console.error('Error checking homeowner registrations:', error)
      }
    }

    const loadInitialData = async () => {
      try {
        const { data: pendingData } = await getPendingRegistrations()
        if (pendingData) {
          // Initialize with current pending IDs (don't trigger notification)
          previousPendingIds = new Set(pendingData.map(r => r.id))
          isInitialized = true
        }
      } catch (error) {
        console.error('Error loading homeowner registrations:', error)
      }
    }

    loadInitialData()

    // Poll for changes every 5 seconds
    const interval = setInterval(() => {
      checkNewRegistrations()
    }, 5000)

    return () => {
      clearInterval(interval)
      if (notificationTimeout) {
        clearTimeout(notificationTimeout)
      }
    }
  }, [playNotification])

  // Clear notification dots when viewing respective pages
  useEffect(() => {
    if (location.pathname === '/reservations' && hasNewReservations) {
      setHasNewReservations(false)
    }
    if (location.pathname === '/homeowners' && hasNewRegistrations) {
      setHasNewRegistrations(false)
    }
  }, [location.pathname, hasNewReservations, hasNewRegistrations])

  // Memoized navigation groups with dynamic notification state
  const navigationGroups = useMemo(() => [
    {
      title: "Dashboard",
      icon: analyticsOutline,
      items: [
        { 
          path: "/overview", 
          label: "Overview", 
          icon: statsChartOutline,
          tooltip: "View system statistics and key metrics at a glance"
        },
      ],
    },
    {
      title: "Manage Facilities",
      icon: businessOutline,
      items: [
        { 
          path: "/facilities", 
          label: "Facilities Schedule", 
          icon: businessOutline,
          tooltip: "View and manage facility booking schedules and availability"
        },
        { 
          path: "/reservations", 
          label: "Facilities Reservation", 
          icon: checkmarkDoneOutline,
          hasNotification: hasNewReservations,
          tooltip: "Review and approve/reject facility reservation requests from homeowners"
        }
      ],
    },
    {
      title: "Manage Community",
      icon: peopleOutline,
      items: [
        { 
          path: "/announcement", 
          label: "Announcements", 
          icon: megaphoneOutline,
          tooltip: "Create and manage community announcements and notifications"
        },
        { 
          path: "/homeowners", 
          label: "Homeowners", 
          icon: peopleOutline,
          hasNotification: hasNewRegistrations,
          tooltip: "View and manage homeowner profiles and information"
        },
      ],
    },
    {
      title: "Finance",
      icon: walletOutline,
      items: [
        { 
          path: "/income", 
          label: "Income Tracker", 
          icon: cashOutline,
          tooltip: "Track and manage HOA income, payments, and financial records"
        },
      ],
    },
  ], [hasNewReservations, hasNewRegistrations])

  // Memoized navigation handler
  const handleNavigate = useCallback((path) => {
    navigate(path)
  }, [navigate])

  // Optimized tooltip handlers
  const handleMouseEnter = useCallback((tooltip) => {
    if (collapsed) return
    
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
    }
    
    const timeout = setTimeout(() => {
      setHoveredItemTooltip(tooltip || "")
    }, 2000)
    
    setTooltipTimeout(timeout)
  }, [collapsed, tooltipTimeout])

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
    }
    setHoveredItemTooltip("")
  }, [tooltipTimeout])

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }
    }
  }, [tooltipTimeout])

  const handleSettingsClick = useCallback(() => {
    navigate("/settings")
  }, [navigate])

  const handleKeyDown = useCallback((event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      action()
    }
  }, [])

  // Memoized user initials
  const userInitials = useMemo(() => {
    if (!profile) return "A"
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
  }, [profile])

  const userName = useMemo(() => {
    if (!profile) return "Admin User"
    return `${profile.firstName} ${profile.lastName}`
  }, [profile])

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Header Section */}
      <div className={styles.header}>
        {!collapsed && (
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <IonIcon icon={homeOutline} />
            </div>
            <div className={styles.logoText}>
              <h1 className={styles.title}>Centella HOA</h1>
              <span className={styles.subtitle}>Management Portal</span>
            </div>
          </div>
        )}

        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          onKeyDown={(e) => handleKeyDown(e, onToggle)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <IonIcon icon={collapsed ? chevronForwardOutline : chevronBackOutline} />
        </button>
      </div>

      {/* Navigation Section */}
      <nav className={styles.navigation} role="navigation" aria-label="Main navigation">
        {navigationGroups.map((group, groupIndex) => (
          <MenuGroup
            key={group.title}
            group={group}
            groupIndex={groupIndex}
            totalGroups={navigationGroups.length}
            collapsed={collapsed}
            currentPath={location.pathname}
            onNavigate={handleNavigate}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </nav>

      {/* User Section */}
      <div className={styles.userSection}>
        {/* Tooltip Display Area */}
        {!collapsed && hoveredItemTooltip && (
          <div className={styles.tooltipDisplay}>
            <div className={styles.tooltipText}>
              {hoveredItemTooltip}
            </div>
          </div>
        )}

        <div className={styles.userProfile}>
          <div className={styles.avatar} aria-hidden="true">
            {userInitials}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {userName}
            </span>
            <span className={styles.userRole}>{profile?.position || "HOA Administrator"}</span>
          </div>
        </div>

   
        <div className={styles.actionButtons}>
          {/*
          <button
            className={`${styles.actionBtn} ${styles.settingsBtn}`}
            onClick={handleSettingsClick}
            onKeyDown={(e) => handleKeyDown(e, handleSettingsClick)}
            title="Settings"
            aria-label="Open settings"
          >
            <span className={styles.actionIcon}>
              <IonIcon icon={settingsOutline} />
            </span>
            <span>Settings</span>
          </button>
          */}

          <button
            className={`${styles.actionBtn} ${styles.logoutBtn}`}
            onClick={logout}
            onKeyDown={(e) => handleKeyDown(e, logout)}
            title="Logout"
            aria-label="Logout from account"
          >
            <span className={styles.actionIcon}>
              <IonIcon icon={logOutOutline} />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default memo(Sidebar)