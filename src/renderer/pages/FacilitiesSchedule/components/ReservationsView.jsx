import { useState, useMemo } from "react"
import { IonIcon } from "@ionic/react"
import {
  basketballOutline,
  businessOutline,
  calendarOutline,
  personOutline,
  callOutline,
  filterOutline,
  checkmarkCircleOutline,
  timeOutline as clockOutline,
  closeCircleOutline,
  hourglassOutline,
  calendarNumberOutline,
  trendingUpOutline,
  chevronDownOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons"
import { formatDate, formatTime, monthNames } from "../utils/dateUtils"
import { getStatusClass } from "../utils/reservationUtils"
import styles from "../styles/ReservationsView.module.css"

function ReservationsView({ reservations, setSelectedReservation, selectedReservation, isFilterOpen, viewMode }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeTimeFilter, setActiveTimeFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Get available years from reservations
  const availableYears = useMemo(() => {
    const years = new Set(reservations.map((r) => new Date(r.date).getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  }, [reservations])

  // Filter reservations based on selected filters
  const filteredReservations = useMemo(() => {
    let filtered = [...reservations]
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    const monthFromNow = new Date(today)
    monthFromNow.setMonth(monthFromNow.getMonth() + 1)

    // Status filter
    if (activeFilter !== "all") {
      if (activeFilter === "upcoming") {
        filtered = filtered.filter((r) => {
          const resDate = new Date(r.date)
          return resDate >= today && (r.status === "Pending" || r.status === "Confirmed")
        })
      } else if (activeFilter === "completed") {
        filtered = filtered.filter((r) => r.status === "Completed")
      } else if (activeFilter === "pending") {
        filtered = filtered.filter((r) => r.status === "Pending")
      } else if (activeFilter === "confirmed") {
        filtered = filtered.filter((r) => r.status === "Confirmed")
      } else if (activeFilter === "cancelled") {
        filtered = filtered.filter((r) => r.status === "Cancelled")
      }
    }

    // Time period filter
    if (activeTimeFilter !== "all") {
      if (activeTimeFilter === "week") {
        filtered = filtered.filter((r) => {
          const resDate = new Date(r.date)
          return resDate >= today && resDate <= weekFromNow
        })
      } else if (activeTimeFilter === "month") {
        filtered = filtered.filter((r) => {
          const resDate = new Date(r.date)
          return resDate >= today && resDate <= monthFromNow
        })
      }
    }

    // Month filter
    if (selectedMonth !== "all") {
      filtered = filtered.filter((r) => {
        const resDate = new Date(r.date)
        return resDate.getMonth() === Number.parseInt(selectedMonth)
      })
    }

    // Year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter((r) => {
        const resDate = new Date(r.date)
        return resDate.getFullYear() === Number.parseInt(selectedYear)
      })
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    return filtered
  }, [reservations, activeFilter, activeTimeFilter, selectedMonth, selectedYear])

  // Pagination calculations
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReservations = filteredReservations.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [activeFilter, activeTimeFilter, selectedMonth, selectedYear, itemsPerPage])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filterButtons = [
    { id: "all", label: "All", icon: filterOutline },
    { id: "upcoming", label: "Upcoming", icon: trendingUpOutline },
    { id: "pending", label: "Pending Payment", icon: hourglassOutline },
    { id: "confirmed", label: "Confirmed", icon: checkmarkCircleOutline },
    { id: "completed", label: "Completed", icon: checkmarkCircleOutline },
    { id: "cancelled", label: "Cancelled", icon: closeCircleOutline },
  ]

  const timeFilterButtons = [
    { id: "all", label: "All Time", icon: calendarOutline },
    { id: "week", label: "This Week", icon: calendarNumberOutline },
    { id: "month", label: "This Month", icon: calendarOutline },
  ]

  const ReservationCard = ({ reservation }) => {
    const isPending = reservation.status === "Pending"

    return (
      <div
        className={`${styles.reservationDetailCard} ${
          selectedReservation?.id === reservation.id ? styles.selectedCard : ""
        } ${styles[`status${reservation.status}`]}`}
        onClick={() => setSelectedReservation(reservation)}
      >
        <div className={styles.cardHeader}>
          <span className={styles.facilityTag}>
            <IonIcon icon={reservation.facility === "Covered Court" ? basketballOutline : businessOutline} />
            {reservation.facility}
          </span>
          <span className={`${styles.statusBadge} ${getStatusClass(reservation.status, styles)}`}>
            <IonIcon
              icon={
                reservation.status === "Pending"
                  ? hourglassOutline
                  : reservation.status === "Confirmed"
                    ? checkmarkCircleOutline
                    : reservation.status === "Cancelled"
                      ? closeCircleOutline
                      : checkmarkCircleOutline
              }
            />
            {reservation.status}
          </span>
        </div>

        {isPending && (
          <div className={styles.paymentNotice}>
            <IonIcon icon={hourglassOutline} />
            Awaiting payment confirmation
          </div>
        )}

        <h3>{reservation.eventName}</h3>

        <div className={styles.reservationDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <IonIcon icon={calendarOutline} />
              Date & Time
            </span>
            <span>
              {formatDate(reservation.date)}
              <br />
              <strong>
                {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
              </strong>
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <IonIcon icon={personOutline} />
              Reservant
            </span>
            <span>{reservation.reservantName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <IonIcon icon={callOutline} />
              Contact
            </span>
            <span>{reservation.contactNumber}</span>
          </div>
        </div>
      </div>
    )
  }

  const ReservationListItem = ({ reservation }) => {
    const isPending = reservation.status === "Pending"

    return (
      <div
        className={`${styles.listItem} ${
          selectedReservation?.id === reservation.id ? styles.selectedListItem : ""
        } ${styles[`listStatus${reservation.status}`]}`}
        onClick={() => setSelectedReservation(reservation)}
      >
        <div className={styles.listItemLeft}>
          <div className={styles.listItemHeader}>
            <h4>{reservation.eventName}</h4>
            {isPending && (
              <span className={styles.listPaymentBadge}>
                <IonIcon icon={hourglassOutline} />
                Awaiting Payment
              </span>
            )}
          </div>
          <div className={styles.listItemMeta}>
            <span className={styles.listMetaItem}>
              <IonIcon icon={reservation.facility === "Covered Court" ? basketballOutline : businessOutline} />
              {reservation.facility}
            </span>
            <span className={styles.listMetaItem}>
              <IonIcon icon={calendarOutline} />
              {formatDate(reservation.date)}
            </span>
            <span className={styles.listMetaItem}>
              <IonIcon icon={clockOutline} />
              {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
            </span>
          </div>
          <div className={styles.listItemDetails}>
            <span>
              <IonIcon icon={personOutline} />
              {reservation.reservantName}
            </span>
            <span>
              <IonIcon icon={callOutline} />
              {reservation.contactNumber}
            </span>
          </div>
        </div>
        <div className={styles.listItemRight}>
          <span className={`${styles.statusBadge} ${getStatusClass(reservation.status, styles)}`}>
            <IonIcon
              icon={
                reservation.status === "Pending"
                  ? hourglassOutline
                  : reservation.status === "Confirmed"
                    ? checkmarkCircleOutline
                    : reservation.status === "Cancelled"
                      ? closeCircleOutline
                      : checkmarkCircleOutline
              }
            />
            {reservation.status}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.reservationsLayout}>
      {/* Filter Section */}
      <div
        className={`${styles.filterSection} ${isFilterOpen ? styles.filterSectionOpen : styles.filterSectionClosed}`}
      >
        <div className={styles.filterContent}>
          <div className={styles.filterTopBar}>
            <div className={styles.filterGroup}>
              <div className={styles.filterHeader}>
                <IonIcon icon={filterOutline} />
                <span>Filter by Status</span>
              </div>
              <div className={styles.filterButtons}>
                {filterButtons.map((filter) => (
                  <button
                    key={filter.id}
                    className={`${styles.filterButton} ${activeFilter === filter.id ? styles.active : ""}`}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    <IonIcon icon={filter.icon} />
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.filterHeader}>
                <IonIcon icon={clockOutline} />
                <span>Filter by Time Period</span>
              </div>
              <div className={styles.filterButtons}>
                {timeFilterButtons.map((filter) => (
                  <button
                    key={filter.id}
                    className={`${styles.filterButton} ${activeTimeFilter === filter.id ? styles.active : ""}`}
                    onClick={() => setActiveTimeFilter(filter.id)}
                  >
                    <IonIcon icon={filter.icon} />
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.filterBottomBar}>
            <div className={styles.dateFilters}>
              <div className={styles.selectWrapper}>
                <IonIcon icon={calendarOutline} className={styles.selectIcon} />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Months</option>
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <IonIcon icon={chevronDownOutline} className={styles.selectArrow} />
              </div>

              <div className={styles.selectWrapper}>
                <IonIcon icon={calendarOutline} className={styles.selectIcon} />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <IonIcon icon={chevronDownOutline} className={styles.selectArrow} />
              </div>

              <div className={styles.selectWrapper}>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className={styles.filterSelect}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                <IonIcon icon={chevronDownOutline} className={styles.selectArrow} />
              </div>
            </div>
          </div>

          <div className={styles.resultsCount}>
            Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(endIndex, filteredReservations.length)}</strong> of <strong>{filteredReservations.length}</strong> reservations
          </div>
        </div>
      </div>

      {/* Reservations Display */}
      {filteredReservations.length === 0 ? (
        <div className={styles.emptyState}>
          <IonIcon icon={calendarOutline} className={styles.emptyStateIcon} />
          <h3>No Reservations Found</h3>
          <p>No reservations match your current filters. Try adjusting your selection.</p>
        </div>
      ) : viewMode === "card" ? (
        <>
          <div className={styles.reservationsGrid}>
            {paginatedReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <IonIcon icon={chevronBackOutline} />
                Previous
              </button>
              
              <div className={styles.paginationNumbers}>
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`${styles.paginationNumber} ${currentPage === pageNum ? styles.active : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className={styles.paginationEllipsis}>...</span>
                  }
                  return null
                })}
              </div>

              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <IonIcon icon={chevronForwardOutline} />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.reservationsList}>
            {paginatedReservations.map((reservation) => (
              <ReservationListItem key={reservation.id} reservation={reservation} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <IonIcon icon={chevronBackOutline} />
                Previous
              </button>
              
              <div className={styles.paginationNumbers}>
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`${styles.paginationNumber} ${currentPage === pageNum ? styles.active : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className={styles.paginationEllipsis}>...</span>
                  }
                  return null
                })}
              </div>

              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <IonIcon icon={chevronForwardOutline} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ReservationsView