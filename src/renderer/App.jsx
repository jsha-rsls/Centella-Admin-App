// src/renderer/App.jsx
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { useState, Component, useEffect } from "react"
import { AuthProvider, useAuth } from "./utils/AuthContext"

// Auth components
import Login from "./auth/Login/Login"
import Register from "./auth/Register/Register"

// Layout components
import Sidebar from "./components/Sidebar/Sidebar"

// Page components
import Overview from "./pages/Overview/Overview"
import FacilitiesSchedule from "./pages/FacilitiesSchedule/FacilitiesSchedule"
import Homeowners from "./pages/Homeowners/Homeowners"
import Announcement from "./pages/Announcement/Announcement"
import Reservations from "./pages/Reservations/Reservations"
import Income from "./pages/Income/Income"

// Loading Screen
import Loading from "./loadingScreen/loading"

// Styles
import dashboardStyles from "./components/Dashboard/Dashboard.module.css"

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#fff',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#e74c3c' }}>Something went wrong</h1>
          <p>The application encountered an error. Please restart the app.</p>
          <details style={{ 
            marginTop: '20px', 
            textAlign: 'left', 
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading, loadingMessage } = useAuth()

  if (loading) {
    return <Loading message={loadingMessage} />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component
function PublicRoute({ children }) {
  const { user, loading, loadingMessage } = useAuth()

  if (loading) {
    return <Loading message={loadingMessage} />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

// Dashboard Layout Component
function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className={dashboardStyles.dashboard}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`${dashboardStyles.main} ${sidebarCollapsed ? dashboardStyles.mainExpanded : ""}`}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  console.log('App component rendering')
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes with Dashboard Layout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect */}
              <Route index element={<Navigate to="/overview" replace />} />
              
              {/* Dashboard Pages */}
              <Route path="overview" element={<Overview />} />
              <Route path="facilities" element={<FacilitiesSchedule />} />
              <Route path="homeowners" element={<Homeowners />} />
              <Route path="announcement" element={<Announcement />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="income" element={<Income />} />
            </Route>

            {/* Catch-all for 404 */}
            <Route path="*" element={
              <div style={{ padding: '40px', backgroundColor: '#fff', minHeight: '100vh' }}>
                <h1>404 - Page Not Found</h1>
                <p>The requested page does not exist.</p>
              </div>
            } />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}