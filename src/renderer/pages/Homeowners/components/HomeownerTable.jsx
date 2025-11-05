import { memo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import {
  eyeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  refreshOutline,
  trashOutline,
} from "ionicons/icons"
import styles from "../styles/HomeownerTable.module.css"

// Memoized row component for pending registrations
const PendingRegistrationRow = memo(({ 
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
    <tr>
      <td>
        <div className={styles.nameCell}>
          <div className={styles.tableAvatar}>
            {registration.fullName.firstName.charAt(0)}
            {registration.fullName.lastName.charAt(0)}
          </div>
          <div>
            <div className={styles.fullName}>
              {registration.fullName.firstName} {registration.fullName.lastName}
            </div>
            <div className={styles.age}>Age {registration.age}</div>
          </div>
        </div>
      </td>
      <td className={styles.accountId}>{registration.accountId}</td>
      <td>
        Block {registration.homeAddress.block}, Lot {registration.homeAddress.lot}
      </td>
      <td className={styles.email}>{registration.email}</td>
      <td>{formattedDate}</td>
      <td>
        {isRejectedTab ? (
          <span className={styles.rejectedBadge}>Rejected</span>
        ) : (
          <span className={styles.pendingBadge}>Pending Review</span>
        )}
      </td>
      <td>
        <div className={styles.tableActions}>
          <button
            className={styles.tableViewBtn}
            onClick={handleView}
            title="View Details"
          >
            <IonIcon icon={eyeOutline} />
          </button>
          {isRejectedTab ? (
            <>
              <button
                className={styles.tableReconsiderBtn}
                onClick={handleReconsider}
                title="Reconsider"
              >
                <IonIcon icon={refreshOutline} />
              </button>
              <button
                className={styles.tableDeleteBtn}
                onClick={handleDelete}
                title="Delete"
              >
                <IonIcon icon={trashOutline} />
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.tableApproveBtn}
                onClick={handleApprove}
                title="Approve"
              >
                <IonIcon icon={checkmarkCircleOutline} />
              </button>
              <button
                className={styles.tableDeclineBtn}
                onClick={handleDecline}
                title="Decline"
              >
                <IonIcon icon={closeCircleOutline} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
})

PendingRegistrationRow.displayName = 'PendingRegistrationRow'

// Memoized row component for registered homeowners
const RegisteredHomeownerRow = memo(({ homeowner, onView, onToggleGoodStanding }) => {
  const formattedDate = new Date(homeowner.registeredDate).toLocaleDateString()
  const residentCount = homeowner.householdMembers.length + 1
  
  const handleView = useCallback(() => {
    onView(homeowner)
  }, [onView, homeowner])
  
  const handleToggle = useCallback((e) => {
    e.stopPropagation()
    onToggleGoodStanding(homeowner.id, e.target.checked)
  }, [onToggleGoodStanding, homeowner.id])
  
  return (
    <tr>
      <td>
        <div className={styles.nameCell}>
          <div className={styles.tableAvatar}>
            {homeowner.fullName.firstName.charAt(0)}
            {homeowner.fullName.lastName.charAt(0)}
          </div>
          <div>
            <div className={styles.fullName}>
              {homeowner.fullName.firstName} {homeowner.fullName.lastName}
            </div>
            <div className={styles.age}>Age {homeowner.age}</div>
          </div>
        </div>
      </td>
      <td className={styles.accountId}>{homeowner.accountId}</td>
      <td>
        Block {homeowner.homeAddress.block}, Lot {homeowner.homeAddress.lot}, Phase{" "}
        {homeowner.homeAddress.phase}
      </td>
      <td className={styles.email}>{homeowner.email}</td>
      <td>{residentCount}</td>
      <td>{formattedDate}</td>
      <td>
        <span className={styles.activeBadge}>Active</span>
      </td>
      <td>
        <div className={styles.tableActions}>
          <button
            className={styles.tableViewBtn}
            onClick={handleView}
            title="View Profile"
          >
            <IonIcon icon={eyeOutline} />
          </button>
        </div>
      </td>
      <td>
        <div className={styles.toggleContainer}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={homeowner.goodStanding || false}
              onChange={handleToggle}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </td>
    </tr>
  )
})

RegisteredHomeownerRow.displayName = 'RegisteredHomeownerRow'

// Memoized table component for pending registrations
export const PendingRegistrationTable = memo(({ 
  registrations, 
  onView, 
  onApprove, 
  onDecline,
  onReconsider,
  onDelete,
  isRejectedTab = false
}) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Account ID</th>
            <th>Home Address</th>
            <th>Email</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <PendingRegistrationRow
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
        </tbody>
      </table>
    </div>
  )
})

PendingRegistrationTable.displayName = 'PendingRegistrationTable'

// Memoized table component for registered homeowners
export const RegisteredHomeownerTable = memo(({ 
  homeowners, 
  onView,
  onToggleGoodStanding
}) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Account ID</th>
            <th>Home Address</th>
            <th>Email</th>
            <th>Residents</th>
            <th>Registered</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Good Standing</th>
          </tr>
        </thead>
        <tbody>
          {homeowners.map((homeowner) => (
            <RegisteredHomeownerRow
              key={homeowner.id}
              homeowner={homeowner}
              onView={onView}
              onToggleGoodStanding={onToggleGoodStanding}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
})

RegisteredHomeownerTable.displayName = 'RegisteredHomeownerTable'