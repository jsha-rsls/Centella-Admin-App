import { memo, useMemo, useCallback } from "react"
import { IonIcon } from "@ionic/react"
import {
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons"
import styles from "../styles/Pagination.module.css"

// Memoized page button component
const PageButton = memo(({ page, isActive, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(page)
  }, [onClick, page])
  
  return (
    <button
      className={`${styles.pageBtn} ${isActive ? styles.activePage : ""}`}
      onClick={handleClick}
    >
      {page}
    </button>
  )
})

PageButton.displayName = 'PageButton'

export const Pagination = memo(({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage)
  }, [totalItems, itemsPerPage])

  const startItem = useMemo(() => {
    return (currentPage - 1) * itemsPerPage + 1
  }, [currentPage, itemsPerPage])

  const endItem = useMemo(() => {
    return Math.min(currentPage * itemsPerPage, totalItems)
  }, [currentPage, itemsPerPage, totalItems])

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }, [totalPages])

  const handlePrevious = useCallback(() => {
    onPageChange(currentPage - 1)
  }, [onPageChange, currentPage])

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1)
  }, [onPageChange, currentPage])

  if (totalItems <= itemsPerPage) {
    return null
  }

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      <div className={styles.paginationControls}>
        <button
          className={styles.pageBtn}
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <IonIcon icon={chevronBackOutline} />
        </button>
        {pageNumbers.map((page) => (
          <PageButton
            key={page}
            page={page}
            isActive={currentPage === page}
            onClick={onPageChange}
          />
        ))}
        <button
          className={styles.pageBtn}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <IonIcon icon={chevronForwardOutline} />
        </button>
      </div>
    </div>
  )
})

Pagination.displayName = 'Pagination'