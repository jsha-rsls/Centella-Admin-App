import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import ModalBase from "./ModalBase"
import RichTextEditor from "../RichTextEditor"
import ImageUploadSection from "../ImageUploadSection"
import ScheduleSection from "../ScheduleSection"
import PublishOptions from "../PublishOptions"
import PreviewModal from "./PreviewModal"
import AlertModal from "./AlertModal"
import { 
  validateAnnouncementForm, 
  getInitialFormData, 
  formatEditingData 
} from "../../utils/formValidation"
import { IoEye, IoCheckmarkCircle } from "react-icons/io5"
import styles from "../../styles/modals/CreateEditModal.module.css"

// Helper functions moved outside component
const getWordCount = (html) => {
  const text = html.replace(/<[^>]*>/g, ' ').trim()
  return text ? text.split(/\s+/).length : 0
}

const getCharCount = (html) => {
  const text = html.replace(/<[^>]*>/g, '').trim()
  return text.length
}

const stripHtmlTags = (html) => {
  return html.replace(/<[^>]*>/g, '').trim()
}

export const CreateEditModal = ({
  showModal,
  onClose,
  onSubmit,
  editingAnnouncement,
  categories,
  onImageUpload,
  submitting = false,
}) => {
  const [formData, setFormData] = useState(getInitialFormData())
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false)
  const [initialFormData, setInitialFormData] = useState(null)

  const titleEditorRef = useRef(null)
  const contentEditorRef = useRef(null)

  // Memoize word/char counts
  const titleCharCount = useMemo(
    () => getCharCount(formData.title),
    [formData.title]
  )

  const contentWordCount = useMemo(
    () => getWordCount(formData.content),
    [formData.content]
  )

  // Memoize derived state
  const isDraft = useMemo(
    () => formData.publishOption === "draft",
    [formData.publishOption]
  )

  // Memoize field validation checker
  const isFieldValid = useCallback((field) => {
    return touched[field] && !errors[field] && formData[field]
  }, [touched, errors, formData])

  // Initialize form when opening modal or editing
  useEffect(() => {
    if (showModal) {
      if (editingAnnouncement) {
        const editData = formatEditingData(editingAnnouncement)
        setFormData(editData)
        setInitialFormData(JSON.stringify(editData))
        setImagePreview(editingAnnouncement.image || null)
        
        setTimeout(() => {
          titleEditorRef.current?.setContent(editingAnnouncement.title || "")
          contentEditorRef.current?.setContent(editingAnnouncement.content || "")
        }, 0)
      } else {
        const initialData = getInitialFormData()
        setFormData(initialData)
        setInitialFormData(JSON.stringify(initialData))
        setImagePreview(null)
        
        setTimeout(() => {
          titleEditorRef.current?.clear()
          contentEditorRef.current?.clear()
        }, 0)
      }
      
      setErrors({})
      setTouched({})
      setHasUnsavedChanges(false)
    }
  }, [showModal, editingAnnouncement])

  // Track unsaved changes
  useEffect(() => {
    if (initialFormData) {
      const currentData = JSON.stringify(formData)
      setHasUnsavedChanges(currentData !== initialFormData)
    }
  }, [formData, initialFormData])

  // Memoize field validator
  const validateField = useCallback((field, value) => {
    let fieldError = ""
    
    switch(field) {
      case "title":
        if (!stripHtmlTags(value)) {
          fieldError = "Title is required"
        }
        break
      case "content":
        if (!stripHtmlTags(value)) {
          fieldError = "Content is required"
        }
        break
      case "category":
        if (!value) {
          fieldError = "Category is required"
        }
        break
      case "scheduledDate":
        if (formData.publishOption === "schedule" && !value) {
          fieldError = "Please select a date for scheduling"
        }
        break
      default:
        break
    }
    
    setErrors(prev => ({ ...prev, [field]: fieldError }))
  }, [formData.publishOption])

  // Memoize event handlers
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Mark field as touched for real-time validation
    setTouched(prev => {
      if (!prev[field]) {
        return { ...prev, [field]: true }
      }
      return prev
    })
  }, [])

  // Separate effect for real-time validation
  useEffect(() => {
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        validateField(field, formData[field])
      }
    })
  }, [formData, touched, validateField])

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }, [formData, validateField])

  const handleImageUpload = useCallback((imageData) => {
    setImagePreview(imageData)
    setFormData(prev => ({ ...prev, image: imageData }))
    
    if (onImageUpload) {
      onImageUpload(imageData)
    }
  }, [onImageUpload])

  const handleCloseWithWarning = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedAlert(true)
    } else {
      onClose()
    }
  }, [hasUnsavedChanges, onClose])

  const handleConfirmClose = useCallback(() => {
    setShowUnsavedAlert(false)
    onClose()
  }, [onClose])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    
    // Mark all fields as touched for validation display
    setTouched({
      title: true,
      content: true,
      category: true,
      scheduledDate: true,
      scheduledTime: true
    })
    
    const { errors: validationErrors, isValid } = validateAnnouncementForm(formData)
    
    if (isValid) {
      onSubmit(formData)
      setHasUnsavedChanges(false)
    } else {
      setErrors(validationErrors)
    }
  }, [formData, onSubmit])

  const handlePreview = useCallback(() => {
    setShowPreview(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setShowPreview(false)
  }, [])

  // Memoize submit button text
  const submitButtonText = useMemo(() => {
    if (submitting) return "Saving..."
    if (editingAnnouncement) return "Update Announcement"
    if (isDraft) return "Save as Draft"
    return "Create Announcement"
  }, [submitting, editingAnnouncement, isDraft])

  // Memoize category options
  const categoryOptions = useMemo(() => (
    <>
      <option value="">Select</option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </>
  ), [categories])

  // Memoize footer buttons
  const footerButtons = useMemo(() => (
    <>
      <button 
        type="button" 
        onClick={handlePreview}
        className={styles.previewButton} 
        disabled={submitting}
        title="Preview announcement"
      >
        <IoEye size={16} />
        Preview
      </button>
      <button 
        type="button" 
        onClick={handleCloseWithWarning} 
        className={styles.cancelButton} 
        disabled={submitting}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        form="announcement-form"
        className={styles.submitButton} 
        disabled={submitting}
      >
        {submitButtonText}
      </button>
    </>
  ), [handlePreview, handleCloseWithWarning, submitting, submitButtonText])

  return (
    <>
      <ModalBase
        show={showModal}
        onClose={handleCloseWithWarning}
        title={editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
        footer={footerButtons}
      >
        <form id="announcement-form" onSubmit={handleSubmit}>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label>Title</label>
              <div className={styles.fieldStatus}>
                <span className={styles.charCount}>
                  {titleCharCount}/130 characters
                </span>
                {isFieldValid("title") && (
                  <IoCheckmarkCircle className={styles.validIcon} size={16} />
                )}
              </div>
            </div>
            <RichTextEditor
              ref={titleEditorRef}
              value={formData.title}
              onChange={(content) => handleChange("title", content)}
              onBlur={() => handleBlur("title")}
              placeholder="Enter title"
              maxLength={130}
              error={touched.title ? errors.title : ""}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label>Content</label>
              <div className={styles.fieldStatus}>
                <span className={styles.charCount}>
                  {contentWordCount} words
                </span>
                {isFieldValid("content") && (
                  <IoCheckmarkCircle className={styles.validIcon} size={16} />
                )}
              </div>
            </div>
            <RichTextEditor
              ref={contentEditorRef}
              value={formData.content}
              onChange={(content) => handleChange("content", content)}
              onBlur={() => handleBlur("content")}
              placeholder="Enter content"
              isContentEditor={true}
              error={touched.content ? errors.content : ""}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label>Category</label>
                {isFieldValid("category") && (
                  <IoCheckmarkCircle className={styles.validIcon} size={16} />
                )}
              </div>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                onBlur={() => handleBlur("category")}
                className={styles.select}
                disabled={submitting}
              >
                {categoryOptions}
              </select>
              {touched.category && errors.category && (
                <span className={styles.error}>
                  {errors.category}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Header Image (Optional)</label>
              <ImageUploadSection
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Publishing Option</label>
            <PublishOptions
              publishOption={formData.publishOption}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          {formData.publishOption === "schedule" && (
            <div className={styles.formGroup}>
              <label>Scheduled Date & Time</label>
              <ScheduleSection
                scheduledDate={formData.scheduledDate}
                scheduledTime={formData.scheduledTime}
                onChange={handleChange}
                errors={touched.scheduledDate ? errors : {}}
                disabled={submitting}
              />
            </div>
          )}
        </form>
      </ModalBase>

      {/* Preview Modal */}
      <PreviewModal
        show={showPreview}
        onClose={handleClosePreview}
        formData={formData}
        imagePreview={imagePreview}
      />

      {/* Unsaved Changes Alert */}
      <AlertModal
        isOpen={showUnsavedAlert}
        onClose={() => setShowUnsavedAlert(false)}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        type="warning"
        confirmText="Close Anyway"
        cancelText="Keep Editing"
      />
    </>
  )
}