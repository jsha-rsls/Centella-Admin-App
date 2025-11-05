import { useState, useCallback, useMemo } from "react"
import { IoEye, IoClose, IoCloudUpload } from "react-icons/io5"
import { storageService } from "../../../services/storageService"
import styles from "../styles/ImageUploadSection.module.css"

const ImageUploadSection = ({ 
  imagePreview, 
  onImageUpload, 
  disabled = false,
  existingImageUrl = null 
}) => {
  const [showPreview, setShowPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // Memoize whether an image exists
  const hasImage = useMemo(
    () => !!(imagePreview || existingImageUrl),
    [imagePreview, existingImageUrl]
  )

  // Memoize current image URL
  const currentImageUrl = useMemo(
    () => imagePreview || existingImageUrl,
    [imagePreview, existingImageUrl]
  )

  // Memoize button label text
  const buttonLabelText = useMemo(() => {
    if (uploading) return null // Will show upload UI
    return hasImage ? "Change Image" : "Choose File"
  }, [uploading, hasImage])

  // Memoize file input label class
  const fileInputLabelClass = useMemo(
    () => `${styles.fileInputLabel} ${uploading ? styles.uploading : ''}`,
    [uploading]
  )

  // Memoize whether to show action buttons
  const showActionButtons = useMemo(
    () => hasImage && !uploading,
    [hasImage, uploading]
  )

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      // Upload to Supabase storage
      const { data, error } = await storageService.uploadImage(file, 'announcements')
      
      if (error) {
        setUploadError(error.message || 'Failed to upload image')
        return
      }

      // Call the parent callback with the public URL
      onImageUpload(data.publicUrl)
      
      // Also create preview for immediate display
      const reader = new FileReader()
      reader.onload = (event) => {
        // You might want to use the uploaded URL instead of local preview
        // onImageUpload(data.publicUrl, event.target.result) // if you want both
      }
      reader.readAsDataURL(file)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }, [onImageUpload])

  const handleRemoveImage = useCallback(async () => {
    if (existingImageUrl) {
      try {
        await storageService.deleteImage(existingImageUrl)
      } catch (error) {
        console.error('Error deleting image:', error)
        // Continue anyway, just log the error
      }
    }
    onImageUpload(null)
  }, [existingImageUrl, onImageUpload])

  const handleShowPreview = useCallback(() => {
    setShowPreview(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setShowPreview(false)
  }, [])

  const handlePreviewOverlayClick = useCallback(() => {
    setShowPreview(false)
  }, [])

  const handlePreviewModalClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none'
    console.error('Failed to load image:', e.target.src)
  }, [])

  return (
    <>
      <div className={styles.fileInputContainer}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInputHidden}
          id="headerImage"
          disabled={disabled || uploading}
        />
        <label 
          htmlFor="headerImage" 
          className={fileInputLabelClass}
        >
          {uploading ? (
            <>
              <IoCloudUpload size={16} />
              Uploading...
            </>
          ) : (
            buttonLabelText
          )}
        </label>
        
        {showActionButtons && (
          <>
            <button
              type="button"
              onClick={handleShowPreview}
              className={styles.previewButton}
              disabled={disabled}
              title="Preview image"
            >
              <IoEye size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className={styles.removeButton}
              disabled={disabled}
              title="Remove image"
            >
              <IoClose size={14} />
            </button>
          </>
        )}
      </div>

      {uploadError && (
        <div className={styles.errorMessage}>
          {uploadError}
        </div>
      )}

      {showPreview && currentImageUrl && (
        <div className={styles.previewOverlay} onClick={handlePreviewOverlayClick}>
          <div className={styles.previewModal} onClick={handlePreviewModalClick}>
            <div className={styles.previewHeader}>
              <h3>Image Preview</h3>
              <button onClick={handleClosePreview} className={styles.closeButton}>
                <IoClose size={20} />
              </button>
            </div>
            <div className={styles.previewContent}>
              <img 
                src={currentImageUrl} 
                alt="Header image preview" 
                onError={handleImageError}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageUploadSection