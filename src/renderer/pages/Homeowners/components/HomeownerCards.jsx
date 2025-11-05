import { memo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import {
  homeOutline,
  mailOutline,
  calendarOutline,
  eyeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  personOutline,
  refreshOutline,
  trashOutline,
} from "ionicons/icons"
import styles from "../styles/HomeownerCards.module.css"

// Memoized card component for pending registrations
const PendingRegistrationCard = memo(({
  registration,
  isRejectedTab,
  onView,
  onApprove,
  onDecline,
  onReconsider,
  onDelete
}) => {
  const formattedDate = new Date(registration.submittedDate).toLocaleDateString()
  
  const handleView = useCallback(() => {
    onView(registration)
  }, [onView, registration])
  
  const handleApprove = useCallback(() => {
    onApprove(registration.id)
  }, [onApprove, registration.id])
  
  const handleDecline = useCallback(() => {
    onDecline(registration.id)
  }, [onDecline, registration.id])
  
  const handleReconsider = useCallback(() => {
    onReconsider(registration.id)
  }, [onReconsider, registration.id])
  
  const handleDelete = useCallback(() => {
    onDelete(registration.id)
  }, [onDelete, registration.id])
  
  return (
    <div className={styles.registrationCard}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {registration.fullName.firstName.charAt(0)}
            {registration.fullName.lastName.charAt(0)}
          </div>
        </div>
        <div className={styles.headerInfo}>
          <h3>
            {registration.fullName.firstName} {registration.fullName.lastName}
          </h3>
          <span className={styles.accountId}>{registration.accountId}</span>
        </div>
        <div className={styles.statusBadge}>
          {isRejectedTab ? (
            <span className={styles.rejectedBadge}>Rejected</span>
          ) : (
            <span className={styles.pendingBadge}>Pending</span>
          )}
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <IonIcon icon={homeOutline} />
            <span>
              Block {registration.homeAddress.block}, Lot {registration.homeAddress.lot}
            </span>
          </div>
          <div className={styles.infoItem}>
            <IonIcon icon={mailOutline} />
            <span>{registration.email}</span>
          </div>
          <div className={styles.infoItem}>
            <IonIcon icon={calendarOutline} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.viewBtn} onClick={handleView}>
          <IonIcon icon={eyeOutline} />
          View
        </button>
        {isRejectedTab ? (
          <>
            <button className={styles.reconsiderBtn} onClick={handleReconsider}>
              <IonIcon icon={refreshOutline} />
              Reconsider
            </button>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              <IonIcon icon={trashOutline} />
              Delete
            </button>
          </>
        ) : (
          <>
            <button className={styles.approveBtn} onClick={handleApprove}>
              <IonIcon icon={checkmarkCircleOutline} />
              Approve
            </button>
            <button className={styles.declineBtn} onClick={handleDecline}>
              <IonIcon icon={closeCircleOutline} />
              Decline
            </button>
          </>
        )}
      </div>
    </div>
  )
})

PendingRegistrationCard.displayName = 'PendingRegistrationCard'

// Memoized card component for registered homeowners
const RegisteredHomeownerCard = memo(({ homeowner, onView }) => {
  const formattedDate = new Date(homeowner.registeredDate).toLocaleDateString()
  const residentCount = homeowner.householdMembers.length + 1
  
  const handleView = useCallback(() => {
    onView(homeowner)
  }, [onView, homeowner])
  
  return (
    <div className={styles.homeownerCard}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {homeowner.fullName.firstName.charAt(0)}
            {homeowner.fullName.lastName.charAt(0)}
          </div>
        </div>
        <div className={styles.headerInfo}>
          <h3>
            {homeowner.fullName.firstName} {homeowner.fullName.lastName}
          </h3>
          <span className={styles.accountId}>{homeowner.accountId}</span>
        </div>
        <div className={styles.statusBadge}>
          <span className={styles.activeBadge}>Active</span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <IonIcon icon={homeOutline} />
            <span>
              Block {homeowner.homeAddress.block}, Lot {homeowner.homeAddress.lot}, Phase{" "}
              {homeowner.homeAddress.phase}
            </span>
          </div>
          <div className={styles.infoItem}>
            <IonIcon icon={personOutline} />
            <span>{residentCount} residents</span>
          </div>
          <div className={styles.infoItem}>
            <IonIcon icon={calendarOutline} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.viewBtn} onClick={handleView}>
          <IonIcon icon={eyeOutline} />
          View Profile
        </button>
      </div>
    </div>
  )
})

RegisteredHomeownerCard.displayName = 'RegisteredHomeownerCard'

// Memoized grid component for pending registrations
export const PendingRegistrationCards = memo(({ 
  registrations, 
  onView, 
  onApprove, 
  onDecline,
  onReconsider,
  onDelete,
  isRejectedTab = false
}) => {
  return (
    <div className={styles.registrationGrid}>
      {registrations.map((registration) => (
        <PendingRegistrationCard
          key={registration.id}
          registration={registration}
          isRejectedTab={isRejectedTab}
          onView={onView}
          onApprove={onApprove}
          onDecline={onDecline}
          onReconsider={onReconsider}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
})

PendingRegistrationCards.displayName = 'PendingRegistrationCards'

// Memoized grid component for registered homeowners
export const RegisteredHomeownerCards = memo(({ 
  homeowners, 
  onView 
}) => {
  return (
    <div className={styles.homeownerGrid}>
      {homeowners.map((homeowner) => (
        <RegisteredHomeownerCard
          key={homeowner.id}
          homeowner={homeowner}
          onView={onView}
        />
      ))}
    </div>
  )
})

RegisteredHomeownerCards.displayName = 'RegisteredHomeownerCards'