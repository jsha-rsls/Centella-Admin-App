"use client"

import { useState, useMemo } from "react"

export function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1)

  const paginationData = useMemo(() => {
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = items.slice(startIndex, endIndex)

    return {
      currentPage,
      totalPages,
      totalItems,
      currentItems,
      startIndex,
      endIndex,
      itemsPerPage,
    }
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, paginationData.totalPages))
    setCurrentPage(pageNumber)
  }

  const nextPage = () => {
    goToPage(currentPage + 1)
  }

  const prevPage = () => {
    goToPage(currentPage - 1)
  }

  const resetPage = () => {
    setCurrentPage(1)
  }

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  }
}
