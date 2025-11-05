import { useState, useEffect } from "react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import styles from "./FacilitiesSchedule.module.css"

// Import components
import TabNavigation from "./components/TabNavigation"
import CalendarView from "./components/CalendarView"
import SummaryView from "./components/SummaryView"
import ReservationsView from "./components/ReservationsView"
import ReservationModal from "./components/ReservationModal"

// Import Supabase service
import { reservationService } from "../../services/reservationService"

function FacilitiesSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [activeTab, setActiveTab] = useState("calendar")
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState("list") // "card" or "list"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await reservationService.getAllReservations()
        setReservations(data)
      } catch (err) {
        console.error("Failed to load reservations:", err.message)
        setError("Failed to load reservations")
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const unsubscribe = reservationService.subscribeToReservations((updatedData) => {
      console.log("Reservations updated in real-time")
      setReservations(updatedData)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleFilterToggle = () => {
    setIsFilterOpen((prev) => !prev)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <Skeleton width={220} height={32} style={{ marginBottom: "8px" }} />
            <Skeleton width={400} height={20} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            padding: "4px",
            background: "white",
            borderRadius: "12px",
            border: "1.5px solid #E8D4D4",
          }}
        >
          <Skeleton width={120} height={40} borderRadius={8} />
          <Skeleton width={120} height={40} borderRadius={8} />
          <Skeleton width={150} height={40} borderRadius={8} />
        </div>

        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            border: "1.5px solid #E8D4D4",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <Skeleton width={40} height={40} borderRadius={8} />
            <Skeleton width={180} height={28} />
            <Skeleton width={40} height={40} borderRadius={8} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {[...Array(7)].map((_, i) => (
              <Skeleton key={`day-${i}`} height={30} />
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "8px",
            }}
          >
            {[...Array(35)].map((_, i) => (
              <Skeleton key={`date-${i}`} height={80} borderRadius={8} />
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Skeleton width={20} height={20} borderRadius={4} />
              <Skeleton width={100} height={16} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Facilities Schedule</h1>
          <p style={{ color: "red" }}>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "#1a1216",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Facilities Schedule</h1>
        <p>Manage facility reservations and schedules for Covered Court and Multi Purpose Hall</p>
      </div>

      <TabNavigation
        styles={styles}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showFilterButton={activeTab === "reservations"}
        onFilterToggle={handleFilterToggle}
        isFilterOpen={isFilterOpen}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {activeTab === "calendar" && (
        <CalendarView
          styles={styles}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setSelectedReservation={setSelectedReservation}
          reservations={reservations}
        />
      )}

      {activeTab === "summary" && <SummaryView styles={styles} reservations={reservations} />}

      {activeTab === "reservations" && (
        <ReservationsView
          styles={styles}
          reservations={reservations}
          setSelectedReservation={setSelectedReservation}
          isFilterOpen={isFilterOpen}
          viewMode={viewMode}
        />
      )}

      <ReservationModal
        styles={styles}
        selectedReservation={selectedReservation}
        setSelectedReservation={setSelectedReservation}
      />
    </div>
  )
}

export default FacilitiesSchedule
