import { memo, useState, useCallback, useMemo } from "react"
import { IonIcon } from "@ionic/react"
import { checkmarkCircleOutline, closeCircleOutline, alertCircleOutline, chevronDownOutline } from "ionicons/icons"
import styles from "../../styles/modals/ConfirmationDialog.module.css"

const DECLINE_REASONS = [
  {
    label: "ID does not match personal information",
    value: "id_mismatch"
  },
  {
    label: "Photos are unclear or illegible",
    value: "unclear_photos"
  },
  {
    label: "Address could not be verified",
    value: "address_not_verified"
  },
  {
    label: "Missing or incomplete information",
    value: "incomplete_info"
  },
  {
    label: "Duplicate account detected",
    value: "duplicate_account"
  },
  {
    label: "Failed identity verification",
    value: "failed_verification"
  },
  {
    label: "Other (provide details)",
    value: "other"
  }
]

// Memoized dropdown item component
const DropdownItem = memo(({ reason, isSelected, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(reason.value)
  }, [onClick, reason.value])
  
  return (
    <button
      className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      {reason.label}
    </button>
  )
})

DropdownItem.displayName = 'DropdownItem'

// Memoized info item component
const InfoItem = memo(({ label, value }) => {
  return (
    <div className={styles.confirmInfoItem}>
      <span className={styles.confirmLabel}>{label}:</span>
      <span>{value}</span>
    </div>
  )
})

InfoItem.displayName = 'InfoItem'

export const ConfirmationDialog = memo(({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  registration 
}) => {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [showReasonDropdown, setShowReasonDropdown] = useState(false)

  const isDecline = useMemo(() => type === 'decline', [type])
  
  const selectedReasonObj = useMemo(() => 
    DECLINE_REASONS.find(r => r.value === selectedReason),
    [selectedReason]
  )
  
  const finalReason = useMemo(() => 
    selectedReason === 'other' ? customReason : selectedReasonObj?.label || "",
    [selectedReason, customReason, selectedReasonObj]
  )

  const fullName = useMemo(() => 
    `${registration?.fullName?.firstName} ${registration?.fullName?.lastName}`,
    [registration?.fullName]
  )

  const address = useMemo(() => 
    `Block ${registration?.homeAddress?.block}, Lot ${registration?.homeAddress?.lot}, Phase ${registration?.homeAddress?.phase}`,
    [registration?.homeAddress]
  )

  const handleConfirm = useCallback(() => {
    if (isDecline && !selectedReason) {
      alert("Please select a reason for declining")
      return
    }
    if (isDecline && selectedReason === 'other' && !customReason.trim()) {
      alert("Please provide details for the custom reason")
      return
    }
    onConfirm(finalReason)
    
    // Reset state after confirmation
    setSelectedReason("")
    setCustomReason("")
    setShowReasonDropdown(false)
  }, [isDecline, selectedReason, customReason, finalReason, onConfirm])

  const handleReasonSelect = useCallback((value) => {
    setSelectedReason(value)
    setShowReasonDropdown(false)
  }, [])

  const handleToggleDropdown = useCallback(() => {
    setShowReasonDropdown(prev => !prev)
  }, [])

  const handleCustomReasonChange = useCallback((e) => {
    setCustomReason(e.target.value)
  }, [])

  const handleOverlayClick = useCallback(() => {
    onClose()
    // Reset state when closing
    setSelectedReason("")
    setCustomReason("")
    setShowReasonDropdown(false)
  }, [onClose])

  const handleDialogClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) return null

  return (
    <div className={styles.confirmOverlay} onClick={handleOverlayClick}>
      <div className={styles.confirmDialog} onClick={handleDialogClick}>
        <div className={styles.confirmHeader}>
          <IonIcon 
            icon={isDecline ? alertCircleOutline : checkmarkCircleOutline} 
            style={{ 
              fontSize: '32px', 
              color: isDecline ? '#DC2626' : '#059669' 
            }} 
          />
          <h3>{isDecline ? 'Decline Registration' : 'Approve Registration'}</h3>
        </div>

        <div className={styles.confirmBody}>
          <p>
            {isDecline 
              ? `Are you sure you want to decline the registration for ${fullName}?`
              : `Are you sure you want to approve the registration for ${fullName}?`
            }
          </p>

          {isDecline && (
            <div className={styles.reasonSection}>
              <label className={styles.reasonLabel}>Reason for declining:</label>
              
              <div className={styles.dropdownWrapper}>
                <button
                  className={styles.dropdownButton}
                  onClick={handleToggleDropdown}
                >
                  <span>
                    {selectedReasonObj?.label || 'Select a reason...'}
                  </span>
                  <IonIcon 
                    icon={chevronDownOutline}
                    className={`${styles.chevronIcon} ${showReasonDropdown ? styles.chevronOpen : ''}`}
                  />
                </button>

                {showReasonDropdown && (
                  <div className={styles.dropdownMenu}>
                    {DECLINE_REASONS.map((reason) => (
                      <DropdownItem
                        key={reason.value}
                        reason={reason}
                        isSelected={selectedReason === reason.value}
                        onClick={handleReasonSelect}
                      />
                    ))}
                  </div>
                )}
              </div>

              {selectedReason === 'other' && (
                <div className={styles.customReasonField}>
                  <label className={styles.customReasonLabel}>Additional details:</label>
                  <textarea
                    value={customReason}
                    onChange={handleCustomReasonChange}
                    placeholder="Please provide details about why you're declining this registration..."
                    rows={4}
                    className={styles.customReasonTextarea}
                  />
                </div>
              )}
            </div>
          )}

          <div className={styles.confirmInfo}>
            <InfoItem 
              label="Account ID" 
              value={registration?.accountId} 
            />
            <InfoItem 
              label="Email" 
              value={registration?.email} 
            />
            <InfoItem 
              label="Address" 
              value={address} 
            />
          </div>
        </div>

        <div className={styles.confirmActions}>
          <button onClick={handleOverlayClick} className={styles.confirmCancelBtn}>
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className={isDecline ? styles.confirmDeclineBtn : styles.confirmApproveBtn}
          >
            <IonIcon icon={isDecline ? closeCircleOutline : checkmarkCircleOutline} />
            {isDecline ? 'Decline' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
})

ConfirmationDialog.displayName = 'ConfirmationDialog'