import { useState, useMemo, memo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import {
  peopleOutline,
  personAddOutline,
  homeOutline,
  timeOutline,
  closeCircleOutline,
} from "ionicons/icons"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import styles from "./Homeowners.module.css"

// Import separated modal components
import { RegistrationModal } from "./components/modals/RegistrationModal"
import { HomeownerModal } from "./components/modals/HomeownerModal"
import { CustomAlertModal } from "./components/modals/CustomAlertModal"
import { useAlert } from "./hooks/useAlert"
import { useHomeowners } from "./hooks/useHomeowners"
import { PendingRegistrationTable, RegisteredHomeownerTable } from "./components/HomeownerTable"
import { PendingRegistrationCards, RegisteredHomeownerCards } from "./components/HomeownerCards"
import { SearchAndFilters } from "./components/SearchAndFilters"
import { Pagination } from "./components/Pagination"
import { filterHomeowners, getUniqueBlocks, getUniquePhases, getPaginatedData } from "./utils/homeownerUtils"
import { exportVerifiedHomeownersToCSV } from "../../services/homeownerExportService"
import { toggleGoodStanding } from "../../services/homeownerService"

function Homeowners() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [selectedHomeowner, setSelectedHomeowner] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBlock, setFilterBlock] = useState("all")
  const [filterPhase, setFilterPhase] = useState("all")
  const [viewMode, setViewMode] = useState("table")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isExporting, setIsExporting] = useState(false)
  
  // Use custom hook
  const {
    pendingRegistrations,
    registeredHomeowners,
    rejectedRegistrations,
    loading,
    error,
    fetchHomeownersData,
    handleVerify: verifyRegistration,
    handleReject: rejectRegistration,
    handleReconsider: reconsiderRegistration,
    handleDelete: deleteRegistration,
    setRegisteredHomeowners
  } = useHomeowners()

  const { alertState, showSuccess, showError, showConfirm } = useAlert()

  // Event handlers with useCallback
  const handleVerify = useCallback(async (registrationId) => {
    try {
      const confirmed = await showConfirm(
        "Are you sure you want to verify this registration? The homeowner will be able to access the system.",
        "Verify Registration",
        { confirmText: "Verify", cancelText: "Cancel" }
      )
      
      if (!confirmed) return

      const result = await verifyRegistration(registrationId)
      
      if (!result.success) {
        await showError(result.error || "Failed to verify registration. Please try again.")
        return
      }

      setSelectedRegistration(null)
      await showSuccess("Registration verified successfully!")
    } catch (err) {
      console.error("Exception verifying registration:", err)
      await showError("An error occurred while verifying the registration.")
    }
  }, [verifyRegistration, showError, showConfirm, showSuccess])

  const handleReject = useCallback(async (registrationId, reason) => {
    try {
      const result = await rejectRegistration(registrationId, reason)
      
      if (!result.success) {
        await showError(result.error || "Failed to reject registration. Please try again.")
        return
      }

      setSelectedRegistration(null)
      await showSuccess("Registration rejected successfully!")
    } catch (err) {
      console.error("Exception rejecting registration:", err)
      await showError("An error occurred while rejecting the registration.")
    }
  }, [rejectRegistration, showError, showSuccess])

  const handleReconsider = useCallback(async (registrationId) => {
    try {
      const confirmed = await showConfirm(
        "Are you sure you want to reconsider this registration? It will be moved back to pending status for re-evaluation.",
        "Reconsider Registration",
        { confirmText: "Reconsider", cancelText: "Cancel" }
      )
      
      if (!confirmed) return

      const result = await reconsiderRegistration(registrationId)
      
      if (!result.success) {
        await showError(result.error || "Failed to reconsider registration. Please try again.")
        return
      }

      setSelectedRegistration(null)
      await showSuccess("Registration moved back to pending for reconsideration!")
    } catch (err) {
      console.error("Exception reconsidering registration:", err)
      await showError("An error occurred while reconsidering the registration.")
    }
  }, [reconsiderRegistration, showError, showConfirm, showSuccess])

  const handleDelete = useCallback(async (registrationId) => {
    try {
      const confirmed = await showConfirm(
        "Are you sure you want to permanently delete this registration? This action cannot be undone.",
        "Delete Registration",
        { confirmText: "Delete", cancelText: "Cancel" }
      )
      
      if (!confirmed) return

      const result = await deleteRegistration(registrationId)
      
      if (!result.success) {
        await showError(result.error || "Failed to delete registration. Please try again.")
        return
      }

      setSelectedRegistration(null)
      await showSuccess("Registration deleted successfully!")
    } catch (err) {
      console.error("Exception deleting registration:", err)
      await showError("An error occurred while deleting the registration.")
    }
  }, [deleteRegistration, showError, showConfirm, showSuccess])

  const handleToggleGoodStanding = useCallback(async (residentId, newStatus) => {
    try {
      const result = await toggleGoodStanding(residentId, newStatus)
      
      if (result.error) {
        await showError("Failed to update good standing status. Please try again.")
        return
      }

      // Refresh the data to get the updated status
      await fetchHomeownersData()

      await showSuccess(`Good standing status ${newStatus ? 'enabled' : 'disabled'} successfully!`)
    } catch (err) {
      console.error("Exception toggling good standing:", err)
      await showError("An error occurred while updating good standing status.")
    }
  }, [showError, showSuccess, fetchHomeownersData, toggleGoodStanding])

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true)
      
      if (registeredHomeowners.length === 0) {
        await showError("No verified homeowners to export")
        return
      }

      exportVerifiedHomeownersToCSV(registeredHomeowners)
      await showSuccess("Homeowners exported successfully!")
    } catch (err) {
      console.error("Error exporting homeowners:", err)
      await showError("Failed to export homeowners. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }, [registeredHomeowners, showError, showSuccess])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleBlockFilterChange = useCallback((e) => {
    setFilterBlock(e.target.value)
    setCurrentPage(1)
  }, [])

  const handlePhaseFilterChange = useCallback((e) => {
    setFilterPhase(e.target.value)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  // Memoized computed values
  const allData = useMemo(() => 
    [...pendingRegistrations, ...registeredHomeowners, ...rejectedRegistrations],
    [pendingRegistrations, registeredHomeowners, rejectedRegistrations]
  )

  const uniqueBlocks = useMemo(() => getUniqueBlocks(allData), [allData])
  const uniquePhases = useMemo(() => getUniquePhases(allData), [allData])

  const filteredPendingRegistrations = useMemo(() => 
    filterHomeowners(pendingRegistrations, searchTerm, filterBlock, filterPhase)
      .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)),
    [pendingRegistrations, searchTerm, filterBlock, filterPhase]
  )

  const filteredRegisteredHomeowners = useMemo(() =>
    filterHomeowners(registeredHomeowners, searchTerm, filterBlock, filterPhase)
      .sort((a, b) => new Date(b.registeredDate) - new Date(a.registeredDate)),
    [registeredHomeowners, searchTerm, filterBlock, filterPhase]
  )

  const filteredRejectedRegistrations = useMemo(() =>
    filterHomeowners(rejectedRegistrations, searchTerm, filterBlock, filterPhase)
      .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)),
    [rejectedRegistrations, searchTerm, filterBlock, filterPhase]
  )

  const paginatedPendingData = useMemo(() => 
    getPaginatedData(filteredPendingRegistrations, currentPage, itemsPerPage),
    [filteredPendingRegistrations, currentPage, itemsPerPage]
  )

  const paginatedRegisteredData = useMemo(() =>
    getPaginatedData(filteredRegisteredHomeowners, currentPage, itemsPerPage),
    [filteredRegisteredHomeowners, currentPage, itemsPerPage]
  )

  const paginatedRejectedData = useMemo(() =>
    getPaginatedData(filteredRejectedRegistrations, currentPage, itemsPerPage),
    [filteredRejectedRegistrations, currentPage, itemsPerPage]
  )

  const totalResidents = useMemo(() =>
    registeredHomeowners.reduce((acc, h) => acc + (h.householdMembers?.length || 0) + 1, 0),
    [registeredHomeowners]
  )

  // Loading state
  if (loading) {
    return (
      <div className={styles.homeowners}>
        <div className={styles.header}>
          <Skeleton width={200} height={32} style={{ marginBottom: '8px' }} />
          <Skeleton width={300} height={20} />
        </div>

        <div className={styles.statsContainer}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1.5px solid #E8D4D4',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Skeleton width={48} height={48} borderRadius={12} />
              <div style={{ flex: 1 }}>
                <Skeleton width={60} height={28} style={{ marginBottom: '8px' }} />
                <Skeleton width={80} height={16} />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1.5px solid #E8D4D4',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <Skeleton height={44} style={{ flex: 1 }} borderRadius={8} />
            <Skeleton width={100} height={44} borderRadius={8} />
            <Skeleton width={120} height={44} borderRadius={8} />
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          background: 'white',
          padding: '8px',
          borderRadius: '12px',
          border: '1.5px solid #E8D4D4'
        }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} width={150} height={44} borderRadius={8} />
          ))}
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1.5px solid #E8D4D4',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr',
            gap: '16px',
            padding: '16px 20px',
            background: '#FFF5F5',
            borderBottom: '1.5px solid #E8D4D4'
          }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height={16} />
            ))}
          </div>

          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: '1px solid #F3E5E5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton width={40} height={40} circle />
                <div style={{ flex: 1 }}>
                  <Skeleton width="80%" height={16} style={{ marginBottom: '4px' }} />
                  <Skeleton width="60%" height={14} />
                </div>
              </div>
              <Skeleton height={16} />
              <Skeleton height={16} />
              <Skeleton height={16} />
              <Skeleton width={80} height={24} borderRadius={12} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Skeleton width={70} height={32} borderRadius={6} />
                <Skeleton width={70} height={32} borderRadius={6} />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '16px 20px',
          background: 'white',
          borderRadius: '12px',
          border: '1.5px solid #E8D4D4'
        }}>
          <Skeleton width={150} height={16} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width={40} height={40} borderRadius={8} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.homeowners}>
        <div className={styles.errorContainer}>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchHomeownersData} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.homeowners}>
      {/* Consistent header with Overview page */}
      <div className={styles.header}>
        <h1>Homeowners</h1>
        <p>Manage homeowner registrations and resident information</p>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <IonIcon icon={timeOutline} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{pendingRegistrations.length}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <IonIcon icon={peopleOutline} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{registeredHomeowners.length}</div>
            <div className={styles.statLabel}>Verified</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <IonIcon icon={closeCircleOutline} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{rejectedRegistrations.length}</div>
            <div className={styles.statLabel}>Rejected</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <IonIcon icon={homeOutline} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{totalResidents}</div>
            <div className={styles.statLabel}>Residents</div>
          </div>
        </div>
      </div>

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filterBlock={filterBlock}
        onBlockFilterChange={handleBlockFilterChange}
        filterPhase={filterPhase}
        onPhaseFilterChange={handlePhaseFilterChange}
        uniqueBlocks={uniqueBlocks}
        uniquePhases={uniquePhases}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === "pending" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("pending")}
        >
          <IonIcon icon={personAddOutline} />
          Pending ({pendingRegistrations.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "registered" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("registered")}
        >
          <IonIcon icon={peopleOutline} />
          Verified ({registeredHomeowners.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "rejected" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("rejected")}
        >
          <IonIcon icon={closeCircleOutline} />
          Rejected ({rejectedRegistrations.length})
        </button>
      </div>

      {activeTab === "pending" && (
        <div className={styles.content}>
          {filteredPendingRegistrations.length === 0 ? (
            <div className={styles.emptyState}>
              <IonIcon icon={personAddOutline} className={styles.emptyIcon} />
              <h3>No pending registrations</h3>
              <p>All registration requests have been processed.</p>
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <PendingRegistrationTable
                  registrations={paginatedPendingData}
                  onView={setSelectedRegistration}
                  onApprove={handleVerify}
                  onDecline={handleReject}
                />
              ) : (
                <PendingRegistrationCards
                  registrations={paginatedPendingData}
                  onView={setSelectedRegistration}
                  onApprove={handleVerify}
                  onDecline={handleReject}
                />
              )}

              <Pagination
                currentPage={currentPage}
                totalItems={filteredPendingRegistrations.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "registered" && (
        <div className={styles.content}>
          {filteredRegisteredHomeowners.length === 0 ? (
            <div className={styles.emptyState}>
              <IonIcon icon={peopleOutline} className={styles.emptyIcon} />
              <h3>No verified homeowners</h3>
              <p>No homeowners have been verified yet.</p>
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <RegisteredHomeownerTable
                  homeowners={paginatedRegisteredData}
                  onView={setSelectedHomeowner}
                  onToggleGoodStanding={handleToggleGoodStanding}
                />
              ) : (
                <RegisteredHomeownerCards
                  homeowners={paginatedRegisteredData}
                  onView={setSelectedHomeowner}
                />
              )}

              <Pagination
                currentPage={currentPage}
                totalItems={filteredRegisteredHomeowners.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "rejected" && (
        <div className={styles.content}>
          {filteredRejectedRegistrations.length === 0 ? (
            <div className={styles.emptyState}>
              <IonIcon icon={closeCircleOutline} className={styles.emptyIcon} />
              <h3>No rejected registrations</h3>
              <p>No registrations have been rejected.</p>
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <PendingRegistrationTable
                  registrations={paginatedRejectedData}
                  onView={setSelectedRegistration}
                  onReconsider={handleReconsider}
                  onDelete={handleDelete}
                  isRejectedTab={true}
                />
              ) : (
                <PendingRegistrationCards
                  registrations={paginatedRejectedData}
                  onView={setSelectedRegistration}
                  onReconsider={handleReconsider}
                  onDelete={handleDelete}
                  isRejectedTab={true}
                />
              )}

              <Pagination
                currentPage={currentPage}
                totalItems={filteredRejectedRegistrations.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      )}

      <RegistrationModal
        selectedRegistration={selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        onApprove={handleVerify}
        onDecline={handleReject}
        onReconsider={handleReconsider}
        onDelete={handleDelete}
        isRejectedTab={activeTab === "rejected"}
      />

      <HomeownerModal
        selectedHomeowner={selectedHomeowner}
        onClose={() => setSelectedHomeowner(null)}
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
    </div>
  )
}

export default memo(Homeowners)