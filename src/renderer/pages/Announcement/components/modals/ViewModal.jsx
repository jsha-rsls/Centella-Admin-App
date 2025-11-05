import { useMemo } from 'react';
import { IoClose } from "react-icons/io5";
import DOMPurify from 'dompurify';
import styles from "../../styles/modals/ViewModal.module.css";

// Move sanitization config outside component
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'u', 'strong', 'em', 'font', 'ul', 'li', 'br', 'p', 'div', 'span'
  ],
  ALLOWED_ATTR: ['size', 'style', 'class'],
  KEEP_CONTENT: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe']
};

// Helper function to sanitize HTML (outside component)
const sanitizeHTML = (html) => {
  if (typeof window !== 'undefined' && html) {
    return DOMPurify.sanitize(html, SANITIZE_CONFIG);
  }
  return html || '';
};

export const ViewModal = ({ showViewModal, onClose, viewingAnnouncement, formatDate }) => {
  // Memoize sanitized title - only recalculate when title changes
  const sanitizedTitle = useMemo(
    () => viewingAnnouncement ? sanitizeHTML(viewingAnnouncement.title) : '',
    [viewingAnnouncement?.title]
  );

  // Memoize sanitized content - only recalculate when content changes
  const sanitizedContent = useMemo(
    () => viewingAnnouncement ? sanitizeHTML(viewingAnnouncement.content) : '',
    [viewingAnnouncement?.content]
  );

  // Memoize formatted dates
  const formattedCreatedAt = useMemo(
    () => viewingAnnouncement ? formatDate(viewingAnnouncement.createdAt) : '',
    [viewingAnnouncement?.createdAt, formatDate]
  );

  const formattedPublishedAt = useMemo(
    () => viewingAnnouncement?.publishedAt ? formatDate(viewingAnnouncement.publishedAt) : null,
    [viewingAnnouncement?.publishedAt, formatDate]
  );

  // Early return if modal shouldn't be shown
  if (!showViewModal || !viewingAnnouncement) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          {/* Render title with HTML formatting */}
          <h2 dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
          <button onClick={onClose} className={styles.closeButton}>
            <IoClose size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {viewingAnnouncement.image && (
            <div className={styles.viewModalImage}>
              <img src={viewingAnnouncement.image} alt="Announcement" />
            </div>
          )}
          
          {/* Render content with HTML formatting */}
          <div 
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            className={styles.viewModalContent}
          />
          
          <div className={styles.viewModalMeta}>
            <p><small>Created: {formattedCreatedAt}</small></p>
            {formattedPublishedAt && (
              <p><small>Published: {formattedPublishedAt}</small></p>
            )}
            <p><small>Views: {viewingAnnouncement.views}</small></p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};