// src/renderer/services/storageService.js
import { supabase } from "../../utils/supabase"

// Generate UUID without external dependency
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const storageService = {
  // Upload image to Supabase storage
  uploadImage: async (file, folder = 'announcements') => {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.')
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please upload images smaller than 5MB.')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${generateUUID()}.${fileExt}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('announcement-images')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('announcement-images')
        .getPublicUrl(fileName)

      return { 
        data: {
          path: data.path,
          publicUrl: publicUrl
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      return { data: null, error }
    }
  },

  // Upload from base64 data URL (for your current implementation)
  uploadFromDataURL: async (dataURL, folder = 'announcements') => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataURL)
      const blob = await response.blob()
      
      // Create file object
      const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })
      
      // Use existing upload method
      return await storageService.uploadImage(file, folder)
    } catch (error) {
      console.error('Error uploading from data URL:', error)
      return { data: null, error }
    }
  },

  // Delete image from storage
  deleteImage: async (imagePath) => {
    try {
      if (!imagePath) return { data: null, error: null }
      
      // Extract path from full URL if needed
      const path = imagePath.includes('announcement-images/') 
        ? imagePath.split('announcement-images/')[1] 
        : imagePath

      const { data, error } = await supabase.storage
        .from('announcement-images')
        .remove([path])

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error deleting image:', error)
      return { data: null, error }
    }
  },

  // Update image (delete old, upload new)
  updateImage: async (oldImageUrl, newFile, folder = 'announcements') => {
    try {
      // Delete old image if it exists
      if (oldImageUrl) {
        await storageService.deleteImage(oldImageUrl)
      }

      // Upload new image
      return await storageService.uploadImage(newFile, folder)
    } catch (error) {
      console.error('Error updating image:', error)
      return { data: null, error }
    }
  }
}