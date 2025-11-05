import { useMemo } from "react"
import { IoClose } from "react-icons/io5"
import DOMPurify from 'dompurify'
import styles from "../../styles/modals/PreviewModal.module.css"

// Move sanitization config outside component
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'u', 'strong', 'em', 'font', 'ul', 'li', 'br', 'p', 'div', 'span'
  ],
  ALLOWED_ATTR: ['size', 'style', 'class'],
  KEEP_CONTENT: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe']
}

// Helper function to sanitize HTML (outside component)
const sanitizeHTML = (html) => {
  if (typeof window !== 'undefined' && html) {
    return DOMPurify.sanitize(html, SANITIZE_CONFIG)
  }
  return html || ''
}

// Status badge mapping outside component
const STATUS_BADGE_MAP = {
  now: { className: 'statusPublished', label: 'Published' },
  draft: { className: 'statusDraft', label: 'Draft' },
  schedule: { className: 'statusScheduled', label: 'Scheduled' }
}

const PreviewModal = ({ show, onClose, formData, imagePreview }) => {
  // Memoize sanitized title
  const sanitizedTitle = useMemo(
    () => sanitizeHTML(formData?.title) || '<em>No title</em>',
    [formData?.title]
  )

  // Memoize sanitized content
  const sanitizedContent = useMemo(
    () => sanitizeHTML(formData?.content) || '<em>No content</em>',
    [formData?.content]
  )

  // Memoize status badge
  const statusBadge = useMemo(() => {
    const publishOption = formData?.publishOption
    const badgeConfig = STATUS_BADGE_MAP[publishOption]
    
    if (!badgeConfig) return null
    
    return (
      <span className={styles[badgeConfig.className]}>
        {badgeConfig.label}
      </span>
    )
  }, [formData?.publishOption])

  // Memoize category display
  const categoryDisplay = useMemo(
    () => formData?.category || "Uncategorized",
    [formData?.category]
  )

  // Memoize scheduled date display
  const scheduledDateDisplay = useMemo(() => {
    if (formData?.publishOption !== 'schedule' || !formData?.scheduledDate) {
      return null
    }
    
    const dateTime = formData.scheduledDate + ' ' + (formData.scheduledTime || '00:00')
    return new Date(dateTime).toLocaleString()
  }, [formData?.publishOption, formData?.scheduledDate, formData?.scheduledTime])

  // Early return if modal is not shown
  if (!show) return null

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div>
            <h2>Preview</h2>
            <p className={styles.previewNote}>This is how your announcement will appear</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <IoClose size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.previewContainer}>
            {/* Announcement Card Preview */}
            <div className={styles.announcementCard}>
              <div className={styles.cardHeader}>
                <div className={styles.categoryBadge}>
                  {categoryDisplay}
                </div>
                {statusBadge}
              </div>

              {imagePreview && (
                <div className={styles.imageContainer}>
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}

              <div className={styles.cardContent}>
                <div 
                  className={styles.title}
                  dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
                />
                
                <div 
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {scheduledDateDisplay && (
                  <div className={styles.scheduledInfo}>
                    📅 Scheduled for: {scheduledDateDisplay}
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.metaInfo}>Created: Just now</span>
                <span className={styles.metaInfo}>Views: 0</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeBtn}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default PreviewModal