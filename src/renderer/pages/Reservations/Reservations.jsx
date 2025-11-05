import { useState, useMemo } from 'react'
import { Upload } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import styles from './Reservations.module.css'
import { useReservations } from './hooks/useReservations'
import { groupReservationsByUser, filterReservations } from './utils/reservationUtils'
import StatsCard from './components/StatsCard/StatsCard'
import FilterButtons from './components/FilterButtons/FilterButtons'
import ReservationsTable from './components/ReservationsTable/ReservationsTable'
import ImportModal from './components/ImportModal/ImportModal'

// Skeleton Components
const StatCardSkeleton = () => (
  <div
    style={{
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}
  >
    <Skeleton circle width={48} height={48} />
    <div style={{ flex: 1 }}>
      <Skeleton width={80} height={14} style={{ marginBottom: '4px' }} />
      <Skeleton width={40} height={28} />
    </div>
  </div>
)

const FilterButtonsSkeleton = () => (
  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
    {[1, 2, 3, 4].map(i => (
      <Skeleton key={i} width={100} height={40} borderRadius={8} />
    ))}
  </div>
)

const TableSkeleton = () => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}
    >
      <Skeleton width={200} height={20} />
    </div>

    <div
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <tr>
            {['Date', 'Time', 'Resident', 'Facility', 'Event', 'Amount', 'Payment', 'Status', 'Actions'].map(
              (header, i) => (
                <th key={i} style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <Skeleton width={60} height={14} />
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
            <tr key={row} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={80} height={14} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={90} height={14} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={100} height={14} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={120} height={14} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={110} height={14} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={60} height={14} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={70} height={24} borderRadius={4} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <Skeleton width={80} height={24} borderRadius={4} />
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <Skeleton width={85} height={32} borderRadius={6} />
                  <Skeleton width={75} height={32} borderRadius={6} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

function Reservations() {
  const {
    reservations,
    stats,
    loading,
    processing,
    handleApprove,
    handleReject,
    handleImportCSV
  } = useReservations()

  const [filter, setFilter] = useState('pending')
  const [showImportModal, setShowImportModal] = useState(false)

  const filteredReservations = useMemo(
    () => filterReservations(reservations, filter),
    [reservations, filter]
  )

  const groupedReservations = useMemo(
    () => groupReservationsByUser(filteredReservations),
    [filteredReservations]
  )

  if (loading) {
    return (
      <div className={styles.reservations}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <Skeleton width={300} height={32} style={{ marginBottom: '8px' }} />
              <Skeleton width={400} height={16} />
            </div>
            <Skeleton width={160} height={44} borderRadius={8} />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          {[1, 2, 3, 4, 5].map(i => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <FilterButtonsSkeleton />
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className={styles.reservations}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>Reservations</h1>
            <p>Manage and review reservation requests from residents</p>
          </div>
          <button
            className={styles.importButton}
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={18} />
            Import CSV
          </button>
        </div>
      </div>

      <StatsCard stats={stats} />

      <FilterButtons currentFilter={filter} setFilter={setFilter} />

      <ReservationsTable
        groupedReservations={groupedReservations}
        handleApprove={handleApprove}
        handleReject={handleReject}
        processing={processing}
      />

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportCSV}
        />
      )}
    </div>
  )
}

export default Reservations