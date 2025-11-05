import { supabase } from "../../utils/supabase"
import { getAdminSignedUrl } from "../../utils/adminImageHelper"

/**
 * Homeowner Service (SECURED + AUTO-DELETE)
 * Handles all database operations for homeowners/residents
 * Now deletes ID photos after verification for privacy
 */

/**
 * Get signed URL for a storage file path
 * @param {string} path - Storage path (e.g., "government-ids/123456_front_...")
 * @param {number} expiresIn - Expiry time in seconds (default 1 hour)
 * @returns {Promise<string|null>} Signed URL or null
 */
const getSignedUrl = async (path, expiresIn = 3600) => {
  if (!path) return null
  
  // If it's already a full URL, return it as-is (backwards compatibility)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Get signed URL from storage
  return await getAdminSignedUrl(path, expiresIn)
}

/**
 * Delete ID images from storage
 * @param {string} frontIdPath - Front ID file path
 * @param {string} backIdPath - Back ID file path
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const deleteIdImages = async (frontIdPath, backIdPath) => {
  try {
    const filesToDelete = []
    
    if (frontIdPath) {
      filesToDelete.push(frontIdPath)
    }
    
    if (backIdPath) {
      filesToDelete.push(backIdPath)
    }
    
    if (filesToDelete.length === 0) {
      return { success: true }
    }
    
    const { error } = await supabase.storage
      .from('user-ids')
      .remove(filesToDelete)
    
    if (error) {
      console.error('❌ Failed to delete ID images:', error)
      return { success: false, error: error.message }
    }
    
    console.log('🗑️ Successfully deleted ID images:', filesToDelete)
    return { success: true }
  } catch (error) {
    console.error('💥 Exception deleting ID images:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Transform database resident to frontend format with signed URLs
 * @param {Object} resident - Database resident object
 * @param {number} expiresIn - URL expiry time in seconds (default 1 hour)
 * @returns {Promise<Object>} Transformed resident object with signed URLs
 */
const transformResident = async (resident, expiresIn = 3600) => {
  // Get signed URLs for ID photos (only if they exist)
  const [frontIdUrl, backIdUrl] = await Promise.all([
    getSignedUrl(resident.front_id_url, expiresIn),
    getSignedUrl(resident.back_id_url, expiresIn)
  ])

  return {
    id: resident.id,
    accountId: resident.account_id,
    fullName: {
      firstName: resident.first_name,
      middleInitial: resident.middle_initial || '',
      lastName: resident.last_name
    },
    birthdate: resident.birth_date,
    age: resident.age,
    contactNumber: resident.contact_number,
    homeAddress: {
      block: resident.block_number,
      lot: resident.lot_number,
      phase: resident.phase_number
    },
    idType: resident.id_type,
    idPhotos: {
      front: frontIdUrl,
      back: backIdUrl
    },
    // Also store the original paths for reference
    front_id_url: resident.front_id_url,
    back_id_url: resident.back_id_url,
    email: resident.email,
    submittedDate: resident.created_at,
    registeredDate: resident.created_at,
    status: resident.status || 'unverified',
    verifiedAt: resident.verified_at,
    verifiedBy: resident.verified_by,
    rejectedAt: resident.rejected_at,
    rejectionReason: resident.rejection_reason,
    goodStanding: resident.good_standing || false,
    householdMembers: []
  }
}

/**
 * Transform multiple residents in batch with optimized signed URL generation
 * @param {Array} residents - Array of database resident objects
 * @param {number} expiresIn - URL expiry time in seconds
 * @returns {Promise<Array>} Array of transformed residents with signed URLs
 */
const transformResidentsBatch = async (residents, expiresIn = 3600) => {
  if (!residents || residents.length === 0) return []

  // Collect all file paths (only those that exist)
  const allPaths = []
  const pathMap = new Map()

  residents.forEach((resident, index) => {
    if (resident.front_id_url) {
      allPaths.push(resident.front_id_url)
      if (!pathMap.has(resident.front_id_url)) {
        pathMap.set(resident.front_id_url, [])
      }
      pathMap.get(resident.front_id_url).push({ index, type: 'front' })
    }
    if (resident.back_id_url) {
      allPaths.push(resident.back_id_url)
      if (!pathMap.has(resident.back_id_url)) {
        pathMap.set(resident.back_id_url, [])
      }
      pathMap.get(resident.back_id_url).push({ index, type: 'back' })
    }
  })

  // Get all signed URLs in one batch using Supabase's batch API
  let urlMap = {}
  
  // Filter out full URLs and paths
  const pathsToSign = allPaths.filter(path => 
    path && !path.startsWith('http://') && !path.startsWith('https://')
  )

  if (pathsToSign.length > 0) {
    try {
      const { data, error } = await supabase.storage
        .from('user-ids')
        .createSignedUrls(pathsToSign, expiresIn)

      if (!error && data) {
        data.forEach(item => {
          if (item.signedUrl) {
            urlMap[item.path] = item.signedUrl
          }
        })
      }
    } catch (err) {
      console.error('Error getting batch signed URLs:', err)
    }
  }

  // Add already-full URLs to map
  allPaths.forEach(path => {
    if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
      urlMap[path] = path
    }
  })

  // Transform residents with signed URLs
  return residents.map(resident => ({
    id: resident.id,
    accountId: resident.account_id,
    fullName: {
      firstName: resident.first_name,
      middleInitial: resident.middle_initial || '',
      lastName: resident.last_name
    },
    birthdate: resident.birth_date,
    age: resident.age,
    contactNumber: resident.contact_number,
    homeAddress: {
      block: resident.block_number,
      lot: resident.lot_number,
      phase: resident.phase_number
    },
    idType: resident.id_type,
    idPhotos: {
      front: urlMap[resident.front_id_url] || null,
      back: urlMap[resident.back_id_url] || null
    },
    front_id_url: resident.front_id_url,
    back_id_url: resident.back_id_url,
    email: resident.email,
    submittedDate: resident.created_at,
    registeredDate: resident.created_at,
    status: resident.status || 'unverified',
    verifiedAt: resident.verified_at,
    verifiedBy: resident.verified_by,
    rejectedAt: resident.rejected_at,
    rejectionReason: resident.rejection_reason,
    goodStanding: resident.good_standing || false,
    householdMembers: []
  }))
}

/**
 * Fetch all residents from the database
 * @param {number} urlExpiresIn - Signed URL expiry time (default 7200s = 2 hours)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getAllHomeowners = async (urlExpiresIn = 7200) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching homeowners:', error)
      return { data: null, error }
    }

    const transformedData = await transformResidentsBatch(data, urlExpiresIn)
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Exception fetching homeowners:', error)
    return { data: null, error }
  }
}

/**
 * Fetch unverified registrations (status = 'unverified')
 * @param {number} urlExpiresIn - Signed URL expiry time (default 7200s = 2 hours)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getPendingRegistrations = async (urlExpiresIn = 7200) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('status', 'unverified')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending registrations:', error)
      return { data: null, error }
    }

    const transformedData = await transformResidentsBatch(data, urlExpiresIn)
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Exception fetching pending registrations:', error)
    return { data: null, error }
  }
}

/**
 * Fetch verified homeowners (status = 'verified')
 * @param {number} urlExpiresIn - Signed URL expiry time (default 7200s = 2 hours)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getRegisteredHomeowners = async (urlExpiresIn = 7200) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('status', 'verified')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching registered homeowners:', error)
      return { data: null, error }
    }

    const transformedData = await transformResidentsBatch(data, urlExpiresIn)
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Exception fetching registered homeowners:', error)
    return { data: null, error }
  }
}

/**
 * Fetch rejected registrations (status = 'rejected')
 * @param {number} urlExpiresIn - Signed URL expiry time (default 7200s = 2 hours)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getRejectedRegistrations = async (urlExpiresIn = 7200) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('status', 'rejected')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rejected registrations:', error)
      return { data: null, error }
    }

    const transformedData = await transformResidentsBatch(data, urlExpiresIn)
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Exception fetching rejected registrations:', error)
    return { data: null, error }
  }
}

/**
 * Get a single homeowner by ID
 * @param {number} id - Resident ID
 * @param {number} urlExpiresIn - Signed URL expiry time (default 3600s = 1 hour)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getHomeownerById = async (id, urlExpiresIn = 3600) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching homeowner by ID:', error)
      return { data: null, error }
    }

    const transformedData = await transformResident(data, urlExpiresIn)
    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Exception fetching homeowner by ID:', error)
    return { data: null, error }
  }
}

/**
 * Verify/Approve a registration
 * ⚠️ AUTOMATICALLY DELETES ID PHOTOS AFTER VERIFICATION FOR PRIVACY
 * @param {number} residentId - Resident ID to verify
 * @param {string} adminUserId - Auth user ID of the admin verifying
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const verifyRegistration = async (residentId, adminUserId) => {
  try {
    // First, fetch the record to get ID photo paths
    const { data: existingRecord, error: fetchError } = await supabase
      .from('residents')
      .select('id, status, front_id_url, back_id_url')
      .eq('id', residentId)
      .single()

    if (fetchError) {
      console.error('Error fetching resident before verification:', fetchError)
      return { 
        data: null, 
        error: { 
          message: 'Resident not found or you do not have permission to view this record.',
          code: fetchError.code 
        } 
      }
    }

    if (!existingRecord) {
      return { 
        data: null, 
        error: { message: 'Resident not found.' } 
      }
    }

    // Perform the verification update
    const { data, error } = await supabase
      .from('residents')
      .update({ 
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: adminUserId,
        // Clear ID paths from database (optional - for extra security)
        front_id_url: null,
        back_id_url: null
      })
      .eq('id', residentId)
      .select()

    if (error) {
      console.error('Error verifying registration:', error)
      
      if (error.code === 'PGRST116') {
        return { 
          data: null, 
          error: { 
            message: 'Permission denied. You may not have the required role to verify registrations.',
            code: error.code 
          } 
        }
      }
      
      return { data: null, error }
    }

    // ✅ DELETE ID IMAGES FROM STORAGE AFTER SUCCESSFUL VERIFICATION
    const deleteResult = await deleteIdImages(
      existingRecord.front_id_url, 
      existingRecord.back_id_url
    )

    if (!deleteResult.success) {
      console.warn('⚠️ Verification succeeded but failed to delete ID images:', deleteResult.error)
      // Don't fail the verification even if deletion fails
    }

    console.log('✅ Registration verified and ID images deleted')
    return { data: data?.[0] || data, error: null }
  } catch (error) {
    console.error('Exception verifying registration:', error)
    return { data: null, error }
  }
}

/**
 * Reject a registration
 * ⚠️ KEEPS ID PHOTOS in case admin needs to review again or user resubmits
 * @param {number} residentId - Resident ID to reject
 * @param {string} adminUserId - Auth user ID of the admin rejecting
 * @param {string} reason - Optional rejection reason
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const rejectRegistration = async (residentId, adminUserId, reason = null) => {
  try {
    // First, check if the record exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from('residents')
      .select('id, status')
      .eq('id', residentId)
      .single()

    if (fetchError) {
      console.error('Error fetching resident before rejection:', fetchError)
      return { 
        data: null, 
        error: { 
          message: 'Resident not found or you do not have permission to view this record.',
          code: fetchError.code 
        } 
      }
    }

    if (!existingRecord) {
      return { 
        data: null, 
        error: { message: 'Resident not found.' } 
      }
    }

    // Perform the update
    const updateData = { 
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      verified_by: adminUserId
    }

    // Add rejection reason if provided
    if (reason) {
      updateData.rejection_reason = reason
    }

    const { data, error } = await supabase
      .from('residents')
      .update(updateData)
      .eq('id', residentId)
      .select()

    if (error) {
      console.error('Error rejecting registration:', error)
      
      if (error.code === 'PGRST116') {
        return { 
          data: null, 
          error: { 
            message: 'Permission denied. You may not have the required role to reject registrations.',
            code: error.code 
          } 
        }
      }
      
      return { data: null, error }
    }

    console.log('📝 Registration rejected (ID photos kept for review)')
    return { data: data?.[0] || data, error: null }
  } catch (error) {
    console.error('Exception rejecting registration:', error)
    return { data: null, error }
  }
}

/**
 * Reconsider a rejected registration (move back to pending)
 * @param {number} residentId - Resident ID to reconsider
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const reconsiderRegistration = async (residentId) => {
  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from('residents')
      .select('id, status')
      .eq('id', residentId)
      .single()

    if (fetchError) {
      console.error('Error fetching resident before reconsideration:', fetchError)
      return { 
        data: null, 
        error: { 
          message: 'Resident not found or you do not have permission to view this record.',
          code: fetchError.code 
        } 
      }
    }

    if (!existingRecord) {
      return { 
        data: null, 
        error: { message: 'Resident not found.' } 
      }
    }

    if (existingRecord.status !== 'rejected') {
      return {
        data: null,
        error: { message: 'Only rejected registrations can be reconsidered.' }
      }
    }

    // Move back to unverified (pending) status
    const { data, error } = await supabase
      .from('residents')
      .update({ 
        status: 'unverified',
        verified_at: null,
        verified_by: null,
        rejected_at: null,
        rejection_reason: null
      })
      .eq('id', residentId)
      .select()

    if (error) {
      console.error('Error reconsidering registration:', error)
      return { data: null, error }
    }

    return { data: data?.[0] || data, error: null }
  } catch (error) {
    console.error('Exception reconsidering registration:', error)
    return { data: null, error }
  }
}

/**
 * Delete a registration permanently
 * ⚠️ DELETES ID PHOTOS from storage
 * @param {number} residentId - Resident ID to delete
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const deleteRegistration = async (residentId) => {
  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from('residents')
      .select('id, status, front_id_url, back_id_url')
      .eq('id', residentId)
      .single()

    if (fetchError) {
      console.error('Error fetching resident before deletion:', fetchError)
      return { 
        data: null, 
        error: { 
          message: 'Resident not found or you do not have permission to view this record.',
          code: fetchError.code 
        } 
      }
    }

    if (!existingRecord) {
      return { 
        data: null, 
        error: { message: 'Resident not found.' } 
      }
    }

    // Delete associated ID images from storage
    await deleteIdImages(existingRecord.front_id_url, existingRecord.back_id_url)

    // Delete the resident record
    const { data, error } = await supabase
      .from('residents')
      .delete()
      .eq('id', residentId)
      .select()

    if (error) {
      console.error('Error deleting registration:', error)
      return { data: null, error }
    }

    console.log('🗑️ Registration and ID photos deleted permanently')
    return { data: data?.[0] || data, error: null }
  } catch (error) {
    console.error('Exception deleting registration:', error)
    return { data: null, error }
  }
}

/**
 * Toggle good standing status for a homeowner
 * @param {number} residentId - Resident ID
 * @param {boolean} goodStanding - New good standing status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const toggleGoodStanding = async (residentId, goodStanding) => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .update({ good_standing: goodStanding })
      .eq('id', residentId)
      .select()

    if (error) {
      console.error('Error updating good standing:', error)
      return { data: null, error }
    }

    return { data: data?.[0] || data, error: null }
  } catch (error) {
    console.error('Exception updating good standing:', error)
    return { data: null, error }
  }
}

/**
 * @deprecated Use verifyRegistration instead
 */
export const approveRegistration = verifyRegistration

/**
 * @deprecated Use rejectRegistration instead (no longer deletes)
 */
export const declineRegistration = async (residentId) => {
  console.warn('declineRegistration is deprecated. Use rejectRegistration instead.')
  const { data: { user } } = await supabase.auth.getUser()
  return rejectRegistration(residentId, user?.id)
}

/**
 * Update homeowner information
 * @param {number} residentId - Resident ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateHomeowner = async (residentId, updates) => {
  try {
    const dbUpdates = {}
    if (updates.firstName) dbUpdates.first_name = updates.firstName
    if (updates.middleInitial) dbUpdates.middle_initial = updates.middleInitial
    if (updates.lastName) dbUpdates.last_name = updates.lastName
    if (updates.birthDate) dbUpdates.birth_date = updates.birthDate
    if (updates.age) dbUpdates.age = updates.age
    if (updates.contactNumber) dbUpdates.contact_number = updates.contactNumber
    if (updates.blockNumber) dbUpdates.block_number = updates.blockNumber
    if (updates.lotNumber) dbUpdates.lot_number = updates.lotNumber
    if (updates.phaseNumber) dbUpdates.phase_number = updates.phaseNumber
    if (updates.idType) dbUpdates.id_type = updates.idType
    if (updates.email) dbUpdates.email = updates.email
    if (updates.frontIdUrl !== undefined) dbUpdates.front_id_url = updates.frontIdUrl
    if (updates.backIdUrl !== undefined) dbUpdates.back_id_url = updates.backIdUrl
    if (updates.status) dbUpdates.status = updates.status

    const { data, error } = await supabase
      .from('residents')
      .update(dbUpdates)
      .eq('id', residentId)
      .select()

    if (error) {
      console.error('Error updating homeowner:', error)
      return { data: null, error }
    }

    return { data: data?.[0] || data, error: null }
  } catch (error) {
    console.error('Exception updating homeowner:', error)
    return { data: null, error }
  }
}