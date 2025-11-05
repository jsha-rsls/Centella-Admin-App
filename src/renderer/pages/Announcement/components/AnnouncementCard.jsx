import { useMemo, useCallback } from 'react';
import styles from '../styles/Card.module.css';
import DOMPurify from 'dompurify';
import {
  IoEyeOutline,
  IoPencilOutline,
  IoFolderOpenOutline,
  IoArchiveOutline,
  IoTrashOutline,
  IoCheckmarkCircleOutline,
  IoEllipseOutline,
  IoSendOutline
} from "react-icons/io5";

// Move sanitization config outside component to avoid recreation
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'u', 'strong', 'em', 'font', 'ul', 'li', 'br', 'p', 'div', 'span'
  ],
  ALLOWED_ATTR: ['size', 'style', 'class'],
  KEEP_CONTENT: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'iframe']
};

// Helper function to extract text from HTML (outside component)
const extractTextFromHTML = (html) => {
  if (typeof window === 'undefined' || !html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Helper function to sanitize HTML (outside component)
const sanitizeHTML = (html) => {
  if (typeof window !== 'undefined' && html) {
    return DOMPurify.sanitize(html, SANITIZE_CONFIG);
  }
  return html || '';
};

export const AnnouncementCard = ({
  announcement,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onPublish,
  currentView,
  getStatusBadge,
  formatDate,
  // Batch selection props
  selectMode = false,
  isSelected = false,
  onSelect
}) => {
  // Memoize sanitized title - only recalculate when title changes
  const sanitizedTitle = useMemo(
    () => sanitizeHTML(announcement.title),
    [announcement.title]
  );

  // Memoize sanitized content - only recalculate when content changes
  const sanitizedContent = useMemo(
    () => sanitizeHTML(announcement.content),
    [announcement.content]
  );

  // Memoize truncated text content for preview
  const truncatedContent = useMemo(() => {
    if (!announcement.content || announcement.content.length === 0) {
      return 'No content';
    }

    const textContent = extractTextFromHTML(sanitizedContent);
    
    if (textContent.length > 150) {
      return `${textContent.substring(0, 150)}...`;
    }
    
    return textContent;
  }, [sanitizedContent, announcement.content]);

  // Memoize status badge to avoid recalculation
  const statusBadge = useMemo(
    () => getStatusBadge(announcement),
    [announcement, getStatusBadge]
  );

  // Memoize formatted dates
  const formattedCreatedAt = useMemo(
    () => formatDate(announcement.createdAt),
    [announcement.createdAt, formatDate]
  );

  const formattedPublishedAt = useMemo(
    () => announcement.publishedAt ? formatDate(announcement.publishedAt) : null,
    [announcement.publishedAt, formatDate]
  );

  // Memoize event handlers to prevent recreating functions
  const handleCardClick = useCallback((e) => {
    if (selectMode && !e.target.closest(`.${styles.cardActions}`)) {
      onSelect(announcement.id);
    }
  }, [selectMode, onSelect, announcement.id]);

  const handleCheckboxClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(announcement.id);
  }, [onSelect, announcement.id]);

  const handleView = useCallback((e) => {
    e.stopPropagation();
    onView(announcement);
  }, [onView, announcement]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit(announcement);
  }, [onEdit, announcement]);

  const handlePublish = useCallback((e) => {
    e.stopPropagation();
    onPublish(announcement.id);
  }, [onPublish, announcement.id]);

  const handleArchive = useCallback((e) => {
    e.stopPropagation();
    onArchive(announcement.id);
  }, [onArchive, announcement.id]);

  const handleUnarchive = useCallback((e) => {
    e.stopPropagation();
    onUnarchive(announcement.id);
  }, [onUnarchive, announcement.id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(announcement.id);
  }, [onDelete, announcement.id]);

  // Memoize card class names
  const cardClassName = useMemo(() => {
    const classes = [styles.announcementCard];
    if (selectMode) classes.push(styles.selectModeCard);
    if (isSelected) classes.push(styles.selectedCard);
    return classes.join(' ');
  }, [selectMode, isSelected]);

  // Memoize card style
  const cardStyle = useMemo(
    () => ({ cursor: selectMode ? 'pointer' : 'default' }),
    [selectMode]
  );

  return (
    <div 
      className={cardClassName}
      onClick={handleCardClick}
      style={cardStyle}
    >
      {/* Selection Checkbox */}
      {selectMode && (
        <div className={styles.checkboxContainer} onClick={handleCheckboxClick}>
          {isSelected ? (
            <IoCheckmarkCircleOutline className={styles.checkboxChecked} size={24} />
          ) : (
            <IoEllipseOutline className={styles.checkboxUnchecked} size={24} />
          )}
        </div>
      )}

      {announcement.image && (
        <div className={styles.cardImage}>
          <img src={announcement.image} alt="Announcement header" />
        </div>
      )}
      
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 
            className={styles.cardTitle}
            dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
          />
          <div className={styles.cardBadges}>
            <span className={`${styles.badge} ${styles[statusBadge]}`}>
              {statusBadge}
            </span>
            <span className={`${styles.badge} ${styles[announcement.category.toLowerCase()]}`}>
              {announcement.category}
            </span>
          </div>
        </div>
        
        <p className={styles.cardDescription}>
          {truncatedContent}
        </p>
        
        <div className={styles.cardMeta}>
          <span>Created: {formattedCreatedAt}</span>
          <span>Views: {announcement.views}</span>
          {formattedPublishedAt && (
            <span>Published: {formattedPublishedAt}</span>
          )}
        </div>
        
        <div className={styles.cardActions}>
          <button 
            onClick={handleView}
            className={styles.viewButton}
            disabled={selectMode}
          >
            <IoEyeOutline /> View
          </button>
          <button 
            onClick={handleEdit}
            className={styles.editButton}
            disabled={selectMode}
          >
            <IoPencilOutline /> Edit
          </button>
          
          {/* Show Publish button for drafts view */}
          {currentView === 'drafts' && announcement.status === 'draft' && (
            <button 
              onClick={handlePublish}
              className={styles.publishButton}
              disabled={selectMode}
            >
              <IoSendOutline /> Publish
            </button>
          )}
          
          {/* Show Unarchive button for archived view */}
          {currentView === 'archived' ? (
            <button 
              onClick={handleUnarchive}
              className={styles.unarchiveButton}
              disabled={selectMode}
            >
              <IoFolderOpenOutline /> Unarchive
            </button>
          ) : currentView !== 'drafts' && (
            /* Show Archive button for active view (not drafts or archived) */
            <button 
              onClick={handleArchive}
              className={styles.archiveButton}
              disabled={announcement.status === 'archived' || selectMode}
            >
              <IoArchiveOutline /> Archive
            </button>
          )}
          
          <button 
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={selectMode}
          >
            <IoTrashOutline /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};