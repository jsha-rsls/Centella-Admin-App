/**
 * ADMIN IMAGE HELPER
 * For Desktop Admin App - View resident ID photos with secure access
 */

import { supabase } from './supabase'

/**
 * Check if current user is an admin
 * @returns {Promise<{isAdmin: boolean, adminData: object|null}>}
 */
export const checkIfAdmin = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { isAdmin: false, adminData: null }
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (adminError || !adminData) {
      return { isAdmin: false, adminData: null }
    }

    return { isAdmin: true, adminData }
  } catch (error) {
    console.error('Error checking admin status:', error)
    return { isAdmin: false, adminData: null }
  }
}

/**
 * Get signed URL for any file (admin access)
 * @param {string} filePath - File path in storage (without bucket name)
 * @param {number} expiresIn - Expiry time in seconds (default 1 hour)
 * @returns {Promise<string|null>} Signed URL
 */
export const getAdminSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    if (!filePath) return null

    // If it's already a full URL, return as-is (for backwards compatibility)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }

    const { data, error } = await supabase.storage
      .from('user-ids')
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('❌ Failed to get signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('💥 Admin signed URL exception:', err)
    return null
  }
}

/**
 * Get signed URLs for multiple files (admin batch operation)
 * Uses Supabase's built-in batch signed URL creation
 * @param {string[]} filePaths - Array of file paths
 * @param {number} expiresIn - Expiry time in seconds (default 1 hour)
 * @returns {Promise<{[key: string]: string}>} Object mapping filePath to signedUrl
 */
export const getAdminMultipleSignedUrls = async (filePaths, expiresIn = 3600) => {
  try {
    if (!filePaths || filePaths.length === 0) return {}

    // Filter out null/undefined paths and already-full URLs
    const validPaths = filePaths.filter(path => {
      if (!path) return false
      if (path.startsWith('http://') || path.startsWith('https://')) return false
      return true
    })

    if (validPaths.length === 0) {
      // Return mapping for already-full URLs
      const urlMap = {}
      filePaths.forEach(path => {
        if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
          urlMap[path] = path
        }
      })
      return urlMap
    }

    // Supabase supports batch signed URL creation
    const { data, error } = await supabase.storage
      .from('user-ids')
      .createSignedUrls(validPaths, expiresIn)

    if (error) {
      console.error('❌ Failed to get multiple signed URLs:', error)
      return {}
    }

    // Convert array to object for easier access
    const urlMap = {}
    if (data) {
      data.forEach((item) => {
        if (item.signedUrl) {
          urlMap[item.path] = item.signedUrl
        }
      })
    }

    // Add back any full URLs that were filtered out
    filePaths.forEach(path => {
      if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
        urlMap[path] = path
      }
    })

    return urlMap
  } catch (err) {
    console.error('💥 Admin multiple signed URLs exception:', err)
    return {}
  }
}

/**
 * Get signed URLs for a resident's ID photos
 * @param {Object} resident - Resident object with front_id_url and back_id_url
 * @param {number} expiresIn - Expiry time in seconds (default 1 hour)
 * @returns {Promise<{frontIdUrl: string|null, backIdUrl: string|null}>}
 */
export const getResidentIdUrls = async (resident, expiresIn = 3600) => {
  try {
    if (!resident) {
      return { frontIdUrl: null, backIdUrl: null }
    }

    const [frontIdUrl, backIdUrl] = await Promise.all([
      getAdminSignedUrl(resident.front_id_url || resident.idPhotos?.front, expiresIn),
      getAdminSignedUrl(resident.back_id_url || resident.idPhotos?.back, expiresIn),
    ])

    return { frontIdUrl, backIdUrl }
  } catch (err) {
    console.error('💥 Get resident ID URLs exception:', err)
    return { frontIdUrl: null, backIdUrl: null }
  }
}

/**
 * Transform resident data and add signed URLs
 * @param {Object} resident - Resident object
 * @param {number} expiresIn - URL expiry time in seconds
 * @returns {Promise<Object>} Resident with signed URLs
 */
export const transformResidentWithUrls = async (resident, expiresIn = 3600) => {
  try {
    if (!resident) return null

    const { frontIdUrl, backIdUrl } = await getResidentIdUrls(resident, expiresIn)

    return {
      ...resident,
      idPhotos: {
        front: frontIdUrl,
        back: backIdUrl,
      },
      front_id_signed_url: frontIdUrl,
      back_id_signed_url: backIdUrl,
    }
  } catch (err) {
    console.error('💥 Transform resident with URLs exception:', err)
    return resident
  }
}

/**
 * Get all residents with their ID photo signed URLs (for admin dashboard)
 * @param {Array} residents - Array of resident objects
 * @param {number} expiresIn - URL expiry time in seconds (default 1 hour)
 * @returns {Promise<Array>} Array of residents with signed URLs
 */
export const attachSignedUrlsToResidents = async (residents, expiresIn = 3600) => {
  try {
    if (!residents || residents.length === 0) {
      return []
    }

    // Collect all file paths
    const allPaths = []
    residents.forEach(resident => {
      const frontPath = resident.front_id_url || resident.idPhotos?.front
      const backPath = resident.back_id_url || resident.idPhotos?.back
      
      if (frontPath) allPaths.push(frontPath)
      if (backPath) allPaths.push(backPath)
    })

    // Get all signed URLs in one batch
    const urlMap = await getAdminMultipleSignedUrls(allPaths, expiresIn)

    // Attach signed URLs to residents
    const residentsWithUrls = residents.map(resident => {
      const frontPath = resident.front_id_url || resident.idPhotos?.front
      const backPath = resident.back_id_url || resident.idPhotos?.back
      
      return {
        ...resident,
        idPhotos: {
          front: urlMap[frontPath] || null,
          back: urlMap[backPath] || null,
        },
        front_id_signed_url: urlMap[frontPath] || null,
        back_id_signed_url: urlMap[backPath] || null,
      }
    })

    return residentsWithUrls
  } catch (err) {
    console.error('💥 Attach signed URLs exception:', err)
    return residents
  }
}

/**
 * Download ID image as blob (for admin to save/print)
 * @param {string} filePath - File path in storage
 * @returns {Promise<Blob|null>} Image blob
 */
export const downloadIdImage = async (filePath) => {
  try {
    if (!filePath) return null

    // If it's a full URL, fetch it directly
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const response = await fetch(filePath)
      return await response.blob()
    }

    // Otherwise, download from storage
    const { data, error } = await supabase.storage
      .from('user-ids')
      .download(filePath)

    if (error) {
      console.error('❌ Failed to download image:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('💥 Download image exception:', err)
    return null
  }
}

/**
 * Get storage statistics (for admin dashboard)
 * @returns {Promise<Object>} Storage stats
 */
export const getStorageStats = async () => {
  try {
    // Check admin access
    const { isAdmin } = await checkIfAdmin()
    if (!isAdmin) {
      console.error('❌ Access denied: Not an admin')
      return null
    }

    // Get all files in government-ids folder
    const { data: govIdFiles, error: govIdError } = await supabase.storage
      .from('user-ids')
      .list('government-ids', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    // Get all files in resubmit-ids folder
    const { data: resubmitFiles, error: resubmitError } = await supabase.storage
      .from('user-ids')
      .list('resubmit-ids', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    const allFiles = [
      ...(govIdFiles || []),
      ...(resubmitFiles || [])
    ]

    if (govIdError && resubmitError) {
      console.error('❌ Failed to get storage stats')
      return null
    }

    // Calculate statistics
    const totalFiles = allFiles.length
    const totalSize = allFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2)

    return {
      totalFiles,
      totalSize,
      totalSizeMB,
      governmentIds: govIdFiles?.length || 0,
      resubmitIds: resubmitFiles?.length || 0,
      files: allFiles,
    }
  } catch (err) {
    console.error('💥 Get storage stats exception:', err)
    return null
  }
}