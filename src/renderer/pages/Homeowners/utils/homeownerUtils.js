// Utility functions for homeowner management

export const filterHomeowners = (homeowners, searchTerm, filterBlock, filterPhase) => {
  return homeowners
    .filter(
      (homeowner) =>
        (homeowner.fullName.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          homeowner.fullName.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          homeowner.accountId.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterBlock === "all" || homeowner.homeAddress.block === filterBlock) &&
        (filterPhase === "all" || homeowner.homeAddress.phase === filterPhase),
    )
    .sort((a, b) => Number.parseInt(a.homeAddress.lot) - Number.parseInt(b.homeAddress.lot))
}

export const getUniqueBlocks = (data) => {
  return [...new Set(data.map((item) => item.homeAddress.block))].sort()
}

export const getUniquePhases = (data) => {
  return [...new Set(data.map((item) => item.homeAddress.phase))].sort()
}

export const getPaginatedData = (data, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return data.slice(startIndex, endIndex)
}

export const getTotalPages = (dataLength, itemsPerPage) => {
  return Math.ceil(dataLength / itemsPerPage)
}