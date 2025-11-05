import DOMPurify from "dompurify"
import { IonIcon } from "@ionic/react"
import { arrowForward } from "ionicons/icons"
import { useNavigate } from "react-router-dom"
import styles from "../styles/Announcements.module.css"

function Announcements({ announcements }) {
  const navigate = useNavigate()

  // Truncate HTML content to approximately 150 characters of plain text
  const truncateContent = (html) => {
    if (!html) return '';
    
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = DOMPurify.sanitize(html)
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    
    // Remove extra whitespace
    const cleaned = textContent.replace(/\s+/g, ' ').trim()
    
    if (cleaned.length <= 150) {
      return cleaned
    }
    
    // Truncate to 150 characters and add ellipsis
    return cleaned.substring(0, 150).trim() + '...'
  }

  const handleViewDetails = (announcementId) => {
    // Navigate to announcement page with the announcement ID in state
    navigate('/announcement', { state: { openAnnouncementId: announcementId } })
  }

  const handleViewAllAnnouncements = () => {
    navigate('/announcement')
  }

  return (
    <div className={styles.announcementsSection}>
      <div className={styles.sectionHeader}>
        <h3>Latest Announcements and Updates</h3>
      </div>
      
      <div className={styles.announcementsList}>
        {announcements.map((announcement, index) => (
          <div key={announcement.id || index} className={styles.announcementItem}>
            <div className={styles.announcementHeader}>
              <h4>{truncateContent(announcement.title)}</h4>
              <span className={styles.announcementTime}>{announcement.time}</span>
            </div>
            <div className={styles.announcementContent}>
              {truncateContent(announcement.content)}
            </div>
            <div className={styles.announcementFooter}>
              <div className={styles.announcementType}>{announcement.type}</div>
              <button 
                className={styles.viewMoreBtn}
                onClick={() => handleViewDetails(announcement.id)}
              >
                <span>View Full Details</span>
                <IonIcon icon={arrowForward} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {announcements.length > 0 && (
        <div className={styles.viewAllSection}>
          <p className={styles.viewAllText}>
            Visit the <strong 
              className={styles.linkText}
              onClick={handleViewAllAnnouncements}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleViewAllAnnouncements()}
            >
              Announcements
            </strong> tab to see all details and past announcements
          </p>
        </div>
      )}
    </div>
  )
}

export default Announcements