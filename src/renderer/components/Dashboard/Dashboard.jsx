// src/renderer/components/Dashboard/Dashboard.jsx
import { useState, useCallback, memo, lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import Sidebar from "../Sidebar/Sidebar"
import styles from "./Dashboard.module.css"

// Lazy load pages for code splitting
const Overview = lazy(() => import("../../pages/Overview/Overview"))
const FacilitiesSchedule = lazy(() => import("../../pages/FacilitiesSchedule/FacilitiesSchedule"))
const Homeowners = lazy(() => import("../../pages/Homeowners/Homeowners"))
const Announcement = lazy(() => import("../../pages/Announcement/Announcement"))
const Income = lazy(() => import("../../pages/Income/Income"))

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    background: '#FFF5F5'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #E8D4D4',
        borderTop: '4px solid #1a1216',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{
        color: '#1a1216',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Memoize toggle handler to prevent unnecessary Sidebar re-renders
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  return (
    <div className={styles.dashboard}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <main className={`${styles.main} ${sidebarCollapsed ? styles.mainExpanded : ""}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/facilities" element={<FacilitiesSchedule />} />
            <Route path="/homeowners" element={<Homeowners />} />
            <Route path="/announcement" element={<Announcement />} />
            <Route path="/income" element={<Income />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default memo(Dashboard)