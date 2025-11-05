/**
 * Homeowner Export Service
 * Handles exporting homeowner data to CSV format
 */

/**
 * Format date to: MM/DD/YYYY @ HH:MM:SS AM/PM
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date
 */
const formatDateForCSV = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  
  hours = hours % 12 || 12
  const hoursFormatted = String(hours).padStart(2, '0')
  
  return `${month}/${day}/${year} @ ${hoursFormatted}:${minutes}:${seconds} ${ampm}`
}

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of homeowner objects
 * @param {Array} headers - Array of header names
 * @param {Array} keys - Array of keys to extract from objects
 * @returns {string} CSV formatted string
 */
const convertToCSV = (data, headers, keys) => {
  // Create header row
  const headerRow = headers.map(h => `"${h}"`).join(',')
  
  // Create data rows
  const dataRows = data.map(item => {
    return keys.map((key, index) => {
      let value = ''
      
      // Handle nested object paths (e.g., 'fullName.firstName')
      if (key.includes('.')) {
        const parts = key.split('.')
        value = parts.reduce((obj, part) => obj?.[part], item) || ''
      } else {
        value = item[key] || ''
      }
      
      // Convert to string
      let stringValue = String(value)
      
      // Format verified date
      if (key === 'verifiedAt' && stringValue) {
        stringValue = formatDateForCSV(stringValue)
      }
      
      // Escape quotes and wrap in quotes (no single quote prefix needed)
      const escaped = stringValue.replace(/"/g, '""')
      return `"${escaped}"`
    }).join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Name of the file to download
 */
const downloadCSV = (csvContent, filename) => {
  // Add BOM to ensure proper encoding in Excel
  const BOM = '\uFEFF'
  const contentWithBOM = BOM + csvContent
  
  // Create a blob from the CSV content
  const blob = new Blob([contentWithBOM], { type: 'text/csv;charset=utf-8;' })
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob)
  
  // Create a temporary anchor element and trigger download
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL
  URL.revokeObjectURL(url)
}

/**
 * Export verified homeowners to CSV
 * @param {Array} homeowners - Array of homeowner objects
 * @param {string} filename - Optional filename (default: homeowners-export.csv)
 */
export const exportVerifiedHomeownersToCSV = (homeowners, filename = 'verified-homeowners.csv') => {
  if (!homeowners || homeowners.length === 0) {
    alert('No homeowners to export')
    return
  }

  try {
    // Define headers and keys to export
    const headers = [
      'Account ID',
      'First Name',
      'Middle Initial',
      'Last Name',
      'Email',
      'Contact Number',
      'Birthdate',
      'Age',
      'Block',
      'Lot',
      'Phase',
      'ID Type',
      'Status',
      'Verified Date',
    ]

    const keys = [
      'accountId',
      'fullName.firstName',
      'fullName.middleInitial',
      'fullName.lastName',
      'email',
      'contactNumber',
      'birthdate',
      'age',
      'homeAddress.block',
      'homeAddress.lot',
      'homeAddress.phase',
      'idType',
      'status',
      'verifiedAt',
    ]

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filenameWithTimestamp = `Verified-Homeowners-${timestamp}.csv`

    // Convert to CSV
    const csvContent = convertToCSV(homeowners, headers, keys)

    // Trigger download
    downloadCSV(csvContent, filenameWithTimestamp)
  } catch (error) {
    console.error('Error exporting homeowners to CSV:', error)
    alert('Failed to export homeowners. Please try again.')
  }
}

/**
 * Export all homeowners (including pending and rejected) to CSV
 * @param {Array} homeowners - Array of homeowner objects
 * @param {string} status - Status filter ('all', 'verified', 'pending', 'rejected')
 */
export const exportAllHomeownersToCSV = (homeowners, status = 'all') => {
  let dataToExport = homeowners

  if (status !== 'all') {
    dataToExport = homeowners.filter(h => 
      h.status === (status === 'pending' ? 'unverified' : status)
    )
  }

  const filename = status === 'all' 
    ? `all-homeowners-${new Date().toISOString().split('T')[0]}.csv`
    : `homeowners-${status}-${new Date().toISOString().split('T')[0]}.csv`

  exportVerifiedHomeownersToCSV(dataToExport, filename)
}