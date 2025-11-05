import { memo, useMemo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import { closeOutline, peopleOutline } from "ionicons/icons"
import styles from "../../styles/modals/HomeownerModal.module.css"

// Memoized detail item component
const DetailItem = memo(({ label, value }) => {
  return (
    <div className={styles.detailItem}>
      <span className={styles.label}>{label}</span>
      <span>{value}</span>
    </div>
  )
})

DetailItem.displayName = 'DetailItem'

// Memoized household member card component
const MemberCard = memo(({ member }) => {
  const initial = useMemo(() => 
    member.name?.charAt(0) || 'M',
    [member.name]
  )
  
  return (
    <div className={styles.memberCard}>
      <div className={styles.memberAvatar}>
        {initial}
      </div>
      <div className={styles.memberInfo}>
        <div className={styles.memberName}>{member.name}</div>
        <div className={styles.memberDetails}>
          {member.relationship} • Age {member.age}
        </div>
      </div>
    </div>
  )
})

MemberCard.displayName = 'MemberCard'

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const calculateAge = (birthdate) => {
  if (!birthdate) return 'N/A'
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export const HomeownerModal = memo(({ selectedHomeowner, onClose }) => {
  const fullName = useMemo(() => {
    if (!selectedHomeowner) return ''
    const { firstName, middleInitial, lastName } = selectedHomeowner.fullName
    return `${firstName} ${middleInitial ? middleInitial + '.' : ''} ${lastName}`.trim()
  }, [selectedHomeowner?.fullName])

  const initials = useMemo(() => {
    if (!selectedHomeowner) return ''
    return `${selectedHomeowner.fullName.firstName.charAt(0)}${selectedHomeowner.fullName.lastName.charAt(0)}`
  }, [selectedHomeowner?.fullName])

  const formattedBirthdate = useMemo(() => 
    formatDate(selectedHomeowner?.birthdate),
    [selectedHomeowner?.birthdate]
  )

  const age = useMemo(() => 
    calculateAge(selectedHomeowner?.birthdate),
    [selectedHomeowner?.birthdate]
  )

  const birthdateDisplay = useMemo(() => {
    if (!selectedHomeowner?.birthdate) return 'N/A'
    return `${formattedBirthdate} (Age: ${age})`
  }, [selectedHomeowner?.birthdate, formattedBirthdate, age])

  const address = useMemo(() => {
    if (!selectedHomeowner) return ''
    const { block, lot, phase } = selectedHomeowner.homeAddress
    return `Block ${block}, Lot ${lot}, Phase ${phase}`
  }, [selectedHomeowner?.homeAddress])

  const idType = useMemo(() => 
    selectedHomeowner?.idType?.replace('_', ' ').toUpperCase() || 'N/A',
    [selectedHomeowner?.idType]
  )

  const formattedRegisteredDate = useMemo(() => 
    formatDate(selectedHomeowner?.registeredDate),
    [selectedHomeowner?.registeredDate]
  )

  const hasHouseholdMembers = useMemo(() => 
    selectedHomeowner?.householdMembers && selectedHomeowner.householdMembers.length > 0,
    [selectedHomeowner?.householdMembers]
  )

  const handleModalClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  if (!selectedHomeowner) return null

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={handleModalClick}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <IonIcon icon={peopleOutline} style={{ fontSize: '20px' }} />
            <h2>Homeowner Details</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <IonIcon icon={closeOutline} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.profileSection}>
            <div className={styles.profileAvatar}>
              {initials}
            </div>
            <div className={styles.profileInfo}>
              <h3>{fullName}</h3>
              <p>{selectedHomeowner.accountId}</p>
              <span className={styles.activeBadge}>Verified</span>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailSection}>
              <h4>Personal Information</h4>
              <div className={styles.detailsList}>
                <DetailItem 
                  label="Birthdate" 
                  value={birthdateDisplay} 
                />
                <DetailItem 
                  label="Contact Number" 
                  value={selectedHomeowner.contactNumber || 'N/A'} 
                />
                <DetailItem 
                  label="Email" 
                  value={selectedHomeowner.email} 
                />
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>Address Information</h4>
              <div className={styles.detailsList}>
                <DetailItem 
                  label="Address" 
                  value={address} 
                />
                <DetailItem 
                  label="ID Type" 
                  value={idType} 
                />
                <DetailItem 
                  label="Registered Date" 
                  value={formattedRegisteredDate} 
                />
              </div>
            </div>
          </div>

          <div className={styles.householdSection}>
            <h4>Household Members</h4>
            {hasHouseholdMembers ? (
              <div className={styles.membersList}>
                {selectedHomeowner.householdMembers.map((member, index) => (
                  <MemberCard 
                    key={index} 
                    member={member} 
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyMembers}>
                <IonIcon icon={peopleOutline} />
                <p>No household members added</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.modalDeclineBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
})

HomeownerModal.displayName = 'HomeownerModal'