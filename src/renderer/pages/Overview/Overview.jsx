import { useState, useEffect } from "react"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import StatsCards from "./components/StatsCards"
import RecentActivity from "./components/RecentActivity"
import TodaySchedule from "./components/TodaySchedule"
import Announcements from "./components/Announcements"
import { getOverviewData } from "../../services/overviewService"
import { supabase } from "../../../utils/supabase"
import styles from "./Overview.module.css"

function Overview() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [stats, setStats] = useState({
    totalHomeowners: 0,
    coveredCourtReserved: 0,
    coveredCourtAvailable: 0,
    multiPurposeReserved: 0,
    multiPurposeAvailable: 0,
    monthlyIncome: 0,
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [todaySchedule, setTodaySchedule] = useState({
    coveredCourt: [],
    multiPurpose: []
  })
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    fetchOverviewData()

    // Set up real-time subscriptions
    const residentsSubscription = supabase
      .channel('residents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'residents'
        },
        (payload) => {
          console.log('Residents changed:', payload)
          fetchOverviewData()
        }
      )
      .subscribe()

    const reservationsSubscription = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('Reservations changed:', payload)
          fetchOverviewData()
        }
      )
      .subscribe()

    // Subscribe only to INSERT and DELETE for announcements (ignore updates for views)
    const announcementsSubscription = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          console.log('Announcement created:', payload)
          fetchOverviewData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'announcements'
        },
        (payload) => {
          console.log('Announcement deleted:', payload)
          fetchOverviewData()
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      residentsSubscription.unsubscribe()
      reservationsSubscription.unsubscribe()
      announcementsSubscription.unsubscribe()
    }
  }, [])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getOverviewData()
      
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
      setTodaySchedule(data.todaySchedule)
      setAnnouncements(data.announcements)
    } catch (err) {
      console.error('Error loading overview data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.overview}>
        <div className={styles.header}>
          <Skeleton width={150} height={32} style={{ marginBottom: '8px' }} />
          <Skeleton width={200} height={20} />
        </div>

        {/* Stats Cards Skeleton */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1.5fr 1fr', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          {/* Total Homeowners Card */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1.5px solid #E8D4D4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Skeleton width={48} height={48} borderRadius={12} />
              <div style={{ flex: 1 }}>
                <Skeleton width={180} height={14} style={{ marginBottom: '8px' }} />
                <Skeleton width={60} height={28} />
              </div>
            </div>
          </div>

          {/* Facilities Card */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1.5px solid #E8D4D4'
          }}>
            <Skeleton width={220} height={14} style={{ marginBottom: '16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2].map((i) => (
                <div key={i} style={{
                  padding: '16px',
                  background: '#FFF5F5',
                  borderRadius: '8px',
                  border: '1.5px solid #E8D4D4'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <div style={{ flex: 1 }}>
                      <Skeleton width={100} height={13} style={{ marginBottom: '6px' }} />
                      <Skeleton width={80} height={11} style={{ marginBottom: '4px' }} />
                      <Skeleton width={90} height={11} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Income Card */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1.5px solid #E8D4D4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Skeleton width={48} height={48} borderRadius={12} />
              <div style={{ flex: 1 }}>
                <Skeleton width={140} height={14} style={{ marginBottom: '8px' }} />
                <Skeleton width={100} height={28} style={{ marginBottom: '4px' }} />
                <Skeleton width={80} height={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Content Boxes Skeleton */}
        <div className={styles.contentBoxes}>
          {/* Recent Activity Skeleton */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1.5px solid #E8D4D4'
          }}>
            <Skeleton width={180} height={18} style={{ marginBottom: '20px' }} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                marginBottom: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(26, 18, 22, 0.2)'
              }}>
                <Skeleton width={36} height={36} borderRadius={8} />
                <div style={{ flex: 1 }}>
                  <Skeleton width={140} height={14} style={{ marginBottom: '4px' }} />
                  <Skeleton width={80} height={12} />
                </div>
                <Skeleton width={80} height={24} borderRadius={6} />
              </div>
            ))}
          </div>

          {/* Today's Schedule Skeleton */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1.5px solid #E8D4D4'
          }}>
            <Skeleton width={200} height={18} style={{ marginBottom: '20px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2].map((i) => (
                <div key={i}>
                  <Skeleton width={120} height={14} style={{ marginBottom: '12px' }} />
                  {[1, 2].map((j) => (
                    <div key={j} style={{
                      padding: '12px',
                      background: '#FFF5F5',
                      borderRadius: '8px',
                      border: '1.5px solid #E8D4D4',
                      borderLeftWidth: '3px',
                      marginBottom: '8px'
                    }}>
                      <Skeleton width={100} height={13} style={{ marginBottom: '4px' }} />
                      <Skeleton width={120} height={12} style={{ marginBottom: '4px' }} />
                      <Skeleton width={80} height={11} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements Skeleton */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1.5px solid #E8D4D4'
        }}>
          <Skeleton width={280} height={18} style={{ marginBottom: '20px' }} />
          {[1, 2].map((i) => (
            <div key={i} style={{
              padding: '16px',
              background: '#FFF5F5',
              borderRadius: '8px',
              border: '1.5px solid #E8D4D4',
              borderLeftWidth: '3px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Skeleton width={200} height={15} />
                <Skeleton width={60} height={18} borderRadius={4} />
              </div>
              <Skeleton count={2} style={{ marginBottom: '12px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width={80} height={20} borderRadius={12} />
                <Skeleton width={120} height={28} borderRadius={6} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.overview}>
        <div className={styles.header}>
          <h1>Overview</h1>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <button 
            onClick={fetchOverviewData}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#1a1216',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overview}>
      <div className={styles.header}>
        <h1>Overview</h1>
        <p>HOA Management Dashboard</p>
      </div>

      <StatsCards stats={stats} />

      <div className={styles.contentBoxes}>
        <RecentActivity activities={recentActivity} />
        <TodaySchedule schedule={todaySchedule} />
      </div>

      <Announcements announcements={announcements} />
    </div>
  )
}

export default Overview