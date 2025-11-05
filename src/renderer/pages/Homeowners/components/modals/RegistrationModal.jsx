import { memo, useState, useMemo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import { closeOutline, checkmarkCircleOutline, closeCircleOutline, imageOutline, peopleOutline, addOutline, warningOutline, checkmarkOutline, refreshOutline, trashOutline } from "ionicons/icons"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import styles from "../../styles/modals/RegistrationModal.module.css"
import { ConfirmationDialog } from "./ConfirmationDialog"
import { CustomAlertModal } from "./CustomAlertModal"
import { useAlert } from "../../hooks/useAlert"

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const calculateAge = (birthdate) => {
  if (!birthdate) return null
  const today = new Date()
  const birth = new Date(birthdate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Memoized detail item component
const DetailItem = memo(({ label, value, isMissing }) => {
  return (
    <div className={styles.detailItem}>
      <span className={styles.label}>{label}</span>
      <span className={isMissing ? styles.missingValue : ''}>
        {value}
      </span>
    </div>
  )
})

DetailItem.displayName = 'DetailItem'

// Memoized ID photo card component
const IDPhotoCard = memo(({ label, photoUrl, index, onOpen, onError }) => {
  const handleClick = useCallback(() => {
    onOpen(index)
  }, [onOpen, index])
  
  const handleError = useCallback((e) => {
    onError(e, label)
  }, [onError, label])
  
  return (
    <div className={styles.idPhotoCard}>
      <div className={styles.idPhotoLabel}>{label}</div>
      {photoUrl ? (
        <div 
          onClick={handleClick}
          className={styles.idPhotoWrapper}
        >
          <img 
            src={photoUrl} 
            alt={label}
            className={styles.idPhoto}
            onError={handleError}
          />
          <div className={styles.idPhotoOverlay}>
            <IonIcon icon={addOutline} />
            <span>Click to enlarge</span>
          </div>
        </div>
      ) : (
        <div className={styles.idPhotoPlaceholder}>
          <IonIcon icon={imageOutline} />
          <span>No image uploaded</span>
        </div>
      )}
    </div>
  )
})

IDPhotoCard.displayName = 'IDPhotoCard'

// Memoized checklist item component
const ChecklistItem = memo(({ id, checked, label, onChange }) => {
  const handleChange = useCallback(() => {
    onChange(id)
  }, [onChange, id])
  
  return (
    <label className={styles.checklistItem}>
      <input type="checkbox" checked={checked} onChange={handleChange} />
      <span className={styles.checklistCheckbox}>
        {checked && <IonIcon icon={checkmarkOutline} />}
      </span>
      <span>{label}</span>
    </label>
  )
})

ChecklistItem.displayName = 'ChecklistItem'

// Memoized missing data alert
const MissingDataAlert = memo(({ missingData }) => {
  return (
    <div className={styles.missingDataAlert}>
      <IonIcon icon={warningOutline} />
      <div className={styles.missingDataContent}>
        <strong>Incomplete Information</strong>
        <p>Some required information is missing from this registration:</p>
        <ul>
          {missingData.birthdate && <li>Birthdate not provided</li>}
          {missingData.contactNumber && <li>Contact number not provided</li>}
          {missingData.idPhotos && <li>ID photos incomplete</li>}
        </ul>
      </div>
    </div>
  )
})

MissingDataAlert.displayName = 'MissingDataAlert'

export const RegistrationModal = memo(({ 
  selectedRegistration, 
  onClose, 
  onApprove, 
  onDecline,
  onReconsider,
  onDelete,
  isRejectedTab = false
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [checklist, setChecklist] = useState({
    idMatches: false,
    photosCleared: false,
    addressVerified: false,
    infoComplete: false
  })
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null })
  
  // Add useAlert hook
  const { alertState, showConfirm } = useAlert()

  const fullName = useMemo(() => {
    if (!selectedRegistration) return ''
    const { firstName, middleInitial, lastName } = selectedRegistration.fullName
    return `${firstName} ${middleInitial ? middleInitial + '.' : ''} ${lastName}`.trim()
  }, [selectedRegistration?.fullName])

  const initials = useMemo(() => {
    if (!selectedRegistration) return ''
    return `${selectedRegistration.fullName.firstName.charAt(0)}${selectedRegistration.fullName.lastName.charAt(0)}`
  }, [selectedRegistration?.fullName])

  const missingData = useMemo(() => ({
    birthdate: !selectedRegistration?.birthdate,
    contactNumber: !selectedRegistration?.contactNumber,
    idPhotos: !selectedRegistration?.idPhotos?.front || !selectedRegistration?.idPhotos?.back
  }), [selectedRegistration])

  const hasMissingData = useMemo(() => 
    Object.values(missingData).some(missing => missing),
    [missingData]
  )

  const formattedBirthdate = useMemo(() => 
    formatDate(selectedRegistration?.birthdate),
    [selectedRegistration?.birthdate]
  )

  const age = useMemo(() => 
    calculateAge(selectedRegistration?.birthdate),
    [selectedRegistration?.birthdate]
  )

  const birthdateDisplay = useMemo(() => {
    if (missingData.birthdate) {
      return (
        <span className={styles.missingTag}>
          <IonIcon icon={warningOutline} />
          Not provided
        </span>
      )
    }
    return `${formattedBirthdate} (Age: ${age})`
  }, [missingData.birthdate, formattedBirthdate, age])

  const contactNumberDisplay = useMemo(() => {
    if (missingData.contactNumber) {
      return (
        <span className={styles.missingTag}>
          <IonIcon icon={warningOutline} />
          Not provided
        </span>
      )
    }
    return selectedRegistration?.contactNumber
  }, [missingData.contactNumber, selectedRegistration?.contactNumber])

  const address = useMemo(() => {
    if (!selectedRegistration) return ''
    const { block, lot, phase } = selectedRegistration.homeAddress
    return `Block ${block}, Lot ${lot}, Phase ${phase}`
  }, [selectedRegistration?.homeAddress])

  const idType = useMemo(() => 
    selectedRegistration?.idType?.replace('_', ' ').toUpperCase() || 'N/A',
    [selectedRegistration?.idType]
  )

  const formattedSubmittedDate = useMemo(() => 
    formatDate(selectedRegistration?.submittedDate) || 'N/A',
    [selectedRegistration?.submittedDate]
  )

  const slides = useMemo(() => {
    const slideArray = []
    if (selectedRegistration?.idPhotos?.front) {
      slideArray.push({
        src: selectedRegistration.idPhotos.front,
        title: "Front ID",
        description: `${fullName} - Front ID Photo`
      })
    }
    if (selectedRegistration?.idPhotos?.back) {
      slideArray.push({
        src: selectedRegistration.idPhotos.back,
        title: "Back ID",
        description: `${fullName} - Back ID Photo`
      })
    }
    return slideArray
  }, [selectedRegistration?.idPhotos, fullName])

  const allChecklistComplete = useMemo(() => 
    Object.values(checklist).every(item => item),
    [checklist]
  )

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const toggleChecklistItem = useCallback((item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }))
  }, [])

  const handleApprove = useCallback(() => {
    setConfirmDialog({ isOpen: true, type: 'approve' })
  }, [])

  const handleDecline = useCallback(() => {
    setConfirmDialog({ isOpen: true, type: 'decline' })
  }, [])

  const handleReconsider = useCallback(async () => {
    const confirmed = await showConfirm(
      `Are you sure you want to reconsider this registration? It will be moved back to pending status for re-evaluation.`,
      "Reconsider Registration",
      { confirmText: "Reconsider", cancelText: "Cancel" }
    )
    
    if (confirmed) {
      onReconsider(selectedRegistration.id)
    }
  }, [showConfirm, onReconsider, selectedRegistration?.id])

  const handleDelete = useCallback(async () => {
    const confirmed = await showConfirm(
      `Are you sure you want to permanently delete this registration? This action cannot be undone.`,
      "Delete Registration",
      { confirmText: "Delete", cancelText: "Cancel" }
    )
    
    if (confirmed) {
      onDelete(selectedRegistration.id)
    }
  }, [showConfirm, onDelete, selectedRegistration?.id])

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog({ isOpen: false, type: null })
  }, [])

  const confirmAction = useCallback((reason) => {
    if (confirmDialog.type === 'approve') {
      onApprove(selectedRegistration.id)
    } else if (confirmDialog.type === 'decline') {
      onDecline(selectedRegistration.id, reason)
    }
    setConfirmDialog({ isOpen: false, type: null })
  }, [confirmDialog.type, selectedRegistration?.id, onApprove, onDecline])

  const handleImageError = useCallback((e, label) => {
    const container = e.target.parentElement
    e.target.remove()
    const placeholder = document.createElement('div')
    placeholder.className = styles.idPhotoPlaceholder
    placeholder.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="32">
        <path d="M85.57 446.25h340.86a32 32 0 0028.17-47.17L284.18 82.58c-12.09-22.44-44.27-22.44-56.36 0L57.4 399.08a32 32 0 0028.17 47.17z" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M250.26 195.39l5.74 122 5.73-121.95a5.74 5.74 0 00-5.79-6h0a5.74 5.74 0 00-5.68 5.95z" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M256 397.25a20 20 0 1120-20 20 20 0 01-20 20z"/>
      </svg>
      <span>Failed to load ${label}</span>
    `
    container.appendChild(placeholder)
  }, [])

  const handleModalClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  if (!selectedRegistration) return null

  return (
    <>
      <div className={styles.modal} onClick={onClose}>
        <div className={styles.modalContent} onClick={handleModalClick}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>
              <IonIcon icon={peopleOutline} style={{ fontSize: '20px' }} />
              <h2>Registration Details</h2>
            </div>
            <button onClick={onClose} className={styles.closeBtn}>
              <IonIcon icon={closeOutline} />
            </button>
          </div>

          <div className={styles.modalBody}>
            {hasMissingData && (
              <MissingDataAlert missingData={missingData} />
            )}

            <div className={styles.profileSection}>
              <div className={styles.profileAvatar}>
                {initials}
              </div>
              <div className={styles.profileInfo}>
                <h3>{fullName}</h3>
                <p>{selectedRegistration.accountId}</p>
              </div>
              <span className={styles.activeBadge}>
                {isRejectedTab ? 'Rejected' : 'Pending Verification'}
              </span>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailSection}>
                <h4>Personal Information</h4>
                <div className={styles.detailsList}>
                  <DetailItem 
                    label="Birthdate" 
                    value={birthdateDisplay}
                    isMissing={missingData.birthdate}
                  />
                  <DetailItem 
                    label="Contact Number" 
                    value={contactNumberDisplay}
                    isMissing={missingData.contactNumber}
                  />
                  <DetailItem 
                    label="Email" 
                    value={selectedRegistration.email}
                    isMissing={false}
                  />
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Address & Verification</h4>
                <div className={styles.detailsList}>
                  <DetailItem 
                    label="Address" 
                    value={address}
                    isMissing={false}
                  />
                  <DetailItem 
                    label="ID Type" 
                    value={idType}
                    isMissing={false}
                  />
                  <DetailItem 
                    label="Submitted Date" 
                    value={formattedSubmittedDate}
                    isMissing={false}
                  />
                </div>
              </div>
            </div>

            <div className={styles.idPhotosSection}>
              <h4>ID Verification</h4>
              <div className={styles.idPhotos}>
                <IDPhotoCard
                  label="FRONT ID"
                  photoUrl={selectedRegistration.idPhotos?.front}
                  index={0}
                  onOpen={openLightbox}
                  onError={handleImageError}
                />
                <IDPhotoCard
                  label="BACK ID"
                  photoUrl={selectedRegistration.idPhotos?.back}
                  index={selectedRegistration.idPhotos?.front ? 1 : 0}
                  onOpen={openLightbox}
                  onError={handleImageError}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#8C8585', marginTop: '12px', textAlign: 'center' }}>
                Click on images to view in full size with zoom controls
              </p>
            </div>

            {!isRejectedTab && (
              <div className={styles.verificationChecklist}>
                <h4>Verification Checklist</h4>
                <p className={styles.checklistSubtext}>
                  Please verify all items before approving this registration
                </p>
                <div className={styles.checklistItems}>
                  <ChecklistItem
                    id="idMatches"
                    checked={checklist.idMatches}
                    label="ID matches personal information"
                    onChange={toggleChecklistItem}
                  />
                  <ChecklistItem
                    id="photosCleared"
                    checked={checklist.photosCleared}
                    label="Photos are clear and readable"
                    onChange={toggleChecklistItem}
                  />
                  <ChecklistItem
                    id="addressVerified"
                    checked={checklist.addressVerified}
                    label="Address has been verified"
                    onChange={toggleChecklistItem}
                  />
                  <ChecklistItem
                    id="infoComplete"
                    checked={checklist.infoComplete}
                    label="All required information is complete"
                    onChange={toggleChecklistItem}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            {isRejectedTab ? (
              <>
                <button onClick={handleDelete} className={styles.modalDeleteBtn}>
                  <IonIcon icon={trashOutline} />
                  Delete Permanently
                </button>
                <button onClick={handleReconsider} className={styles.modalReconsiderBtn}>
                  <IonIcon icon={refreshOutline} />
                  Reconsider
                </button>
              </>
            ) : (
              <>
                <button onClick={handleDecline} className={styles.modalDeclineBtn}>
                  <IonIcon icon={closeCircleOutline} />
                  Decline
                </button>
                <button 
                  onClick={handleApprove} 
                  className={styles.modalApproveBtn}
                  disabled={!allChecklistComplete}
                  title={!allChecklistComplete ? 'Complete verification checklist to approve' : ''}
                >
                  <IonIcon icon={checkmarkCircleOutline} />
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={closeLightbox}
        slides={slides}
        index={lightboxIndex}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true
        }}
        styles={{ container: { backgroundColor: "rgba(35, 24, 40, 0.95)" } }}
        animation={{ fade: 250 }}
        controller={{ closeOnBackdropClick: true }}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmAction}
        type={confirmDialog.type}
        registration={selectedRegistration}
      />

      <CustomAlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
      />
    </>
  )
})

RegistrationModal.displayName = 'RegistrationModal'