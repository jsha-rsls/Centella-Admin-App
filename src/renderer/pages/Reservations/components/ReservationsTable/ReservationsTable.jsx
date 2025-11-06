import { useMemo, memo, useState } from "react"
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Clipboard } from "lucide-react"
import { formatDate, formatTime } from "../../utils/reservationUtils"
import Modal from "./Modal"
import styles from "./ReservationsTable.module.css"

// Simple status badge
const StatusBadge = memo(({ status }) => {
  const config = {
    pending: { label: "Pending", className: styles.statusPending },
    confirmed: { label: "Approved", className: styles.statusApproved },
    rejected: { label: "Rejected", className: styles.statusRejected },
    cancelled: { label: "Cancelled", className: styles.statusCancelled },
    completed: { label: "Completed", className: styles.statusCompleted },
  }

  const { label, className } = config[status] || config.pending
  return <span className={className}>{label}</span>
})

StatusBadge.displayName = "StatusBadge"

// Payment Type Badge - displays Cash, Online, or Free
const PaymentTypeBadge = memo(({ paymentType, isFree }) => {
  if (isFree) {
    return <span className={styles.paymentFree}>Free</span>
  }

  if (!paymentType) {
    return <span className={styles.paymentNotSet}>Not Set</span>
  }

  const config = {
    cash: { label: "Cash", className: styles.paymentCash },
    online: { label: "Online", className: styles.paymentOnline },
  }

  const { label, className } = config[paymentType.toLowerCase()] || { 
    label: paymentType, 
    className: styles.paymentNotSet 
  }
  
  return <span className={className}>{label}</span>
})

PaymentTypeBadge.displayName = "PaymentTypeBadge"

// Table row for each reservation
const ReservationRow = memo(({ reservation, onApprove, onReject, processing }) => {
  const isFree = reservation.residents.good_standing
  const isPending = reservation.status === "pending"

  return (
    <tr className={styles.row}>
      <td>{formatDate(reservation.reservation_date)}</td>
      <td className={styles.timeCell}>
        {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
      </td>
      <td>
        <strong>
          {reservation.residents.first_name} {reservation.residents.last_name}
        </strong>
      </td>
      <td>
        <strong>{reservation.facilities.name}</strong>
      </td>
      <td className={styles.purposeCell} title={reservation.purpose}>
        {reservation.purpose}
      </td>
      <td className={styles.amountCell}>
        {isFree ? (
          <span className={styles.freeText}>FREE</span>
        ) : (
          `₱${Number.parseFloat(reservation.total_amount).toFixed(2)}`
        )}
      </td>
      <td>
        <PaymentTypeBadge paymentType={reservation.payment_type} isFree={isFree} />
      </td>
      <td>
        <StatusBadge status={reservation.status} />
      </td>
      <td>
        {isPending ? (
          <div className={styles.actions}>
            <button
              className={styles.btnApprove}
              onClick={() => onApprove(reservation)}
              disabled={processing}
              title="Approve this reservation"
            >
              <CheckCircle size={16} />
              <span>Approve</span>
            </button>
            <button
              className={styles.btnReject}
              onClick={() => onReject(reservation)}
              disabled={processing}
              title="Reject this reservation"
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <span className={styles.noAction}>—</span>
        )}
      </td>
    </tr>
  )
})

ReservationRow.displayName = "ReservationRow"

// Main component
const ReservationsTable = ({ groupedReservations, handleApprove, handleReject, processing }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    reservation: null,
  })

  const itemsPerPage = 10

  // Flatten all reservations from groups and sort by latest first
  const allReservations = useMemo(() => {
    const flattened = Object.values(groupedReservations).flatMap((group) => group.reservations)
    
    // Sort by created_at (newest first)
    return flattened.sort((a, b) => {
      const dateA = new Date(a.created_at || a.reservation_date)
      const dateB = new Date(b.created_at || b.reservation_date)
      return dateB - dateA // Descending order (newest first)
    })
  }, [groupedReservations])

  // Determine current count based on the actual filtered reservations
  const reservationCount = allReservations.length
  
  // Determine the current tab/status by checking the first reservation's status
  const getCurrentTabLabel = () => {
    if (allReservations.length === 0) return "No"
    
    const firstStatus = allReservations[0].status
    
    switch (firstStatus) {
      case 'pending':
        return 'Pending'
      case 'confirmed':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'cancelled':
        return 'Cancelled'
      case 'completed':
        return 'Completed'
      default:
        return 'Unknown'
    }
  }
  
  const tabLabel = getCurrentTabLabel()

  const totalPages = Math.ceil(allReservations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReservations = allReservations.slice(startIndex, endIndex)

  // Reset to page 1 when reservations change
  useMemo(() => {
    setCurrentPage(1)
  }, [allReservations.length])

  const handleApproveClick = (reservation) => {
    const isFree = reservation.residents.good_standing
    const residentName = `${reservation.residents.first_name} ${reservation.residents.last_name}`
    const isCashPayment = reservation.payment_type?.toLowerCase() === 'cash'
    
    const paymentTypeText = reservation.payment_type 
      ? `Payment Type: ${reservation.payment_type.toUpperCase()}`
      : 'Payment Type: Not Set'
    
    let message = ''
    
    if (isFree) {
      message = `Approve FREE reservation for ${residentName}?\n\n(Good Standing - No payment required)`
    } else if (isCashPayment) {
      message = `Approve reservation for ${residentName}?\n\nAmount: ₱${parseFloat(reservation.total_amount).toFixed(2)}\n${paymentTypeText}\n\n✓ Payment status will be marked as PAID (cash received)`
    } else {
      message = `Approve reservation for ${residentName}?\n\nAmount: ₱${parseFloat(reservation.total_amount).toFixed(2)}\n${paymentTypeText}\nPayment Status: ${reservation.payment_status}`
    }

    setModalState({
      isOpen: true,
      title: "Approve Reservation",
      message: message,
      action: "approve",
      reservation: reservation,
    })
  }

  const handleRejectClick = (reservation) => {
    const residentName = `${reservation.residents.first_name} ${reservation.residents.last_name}`
    
    setModalState({
      isOpen: true,
      title: "Reject Reservation",
      message: `Are you sure you want to reject the reservation for ${residentName}?`,
      action: "reject",
      reservation: reservation,
    })
  }

  const handleModalConfirm = async () => {
    if (!modalState.reservation) return

    if (modalState.action === "approve") {
      await handleApprove(modalState.reservation.id)
    } else if (modalState.action === "reject") {
      await handleReject(modalState.reservation.id)
    }
    
    setModalState({ 
      isOpen: false, 
      title: "", 
      message: "", 
      action: null, 
      reservation: null 
    })
  }

  const handleModalCancel = () => {
    setModalState({ 
      isOpen: false, 
      title: "", 
      message: "", 
      action: null, 
      reservation: null 
    })
  }

  if (allReservations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Clipboard size={48} strokeWidth={1.5} />
        </div>
        <div className={styles.emptyText}>No reservations found</div>
        <div className={styles.emptySubtext}>Reservations will appear here once residents make bookings</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        confirmText={modalState.action === "approve" ? "Approve" : "Reject"}
        isLoading={processing}
        isReject={modalState.action === "reject"}
      />

      <div className={styles.tableControls}>
        <div className={styles.tableInfo}>
          <span className={styles.totalGroups}>
            {reservationCount} {tabLabel} Reservation{reservationCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Resident</th>
              <th>Facility</th>
              <th>Event</th>
              <th>Amount</th>
              <th>Payment Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReservations.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                processing={processing}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>

          <div className={styles.pageInfo}>
            Page <span className={styles.currentPage}>{currentPage}</span> of{" "}
            <span className={styles.totalPages}>{totalPages}</span>
          </div>

          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            title="Next page"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(ReservationsTable)