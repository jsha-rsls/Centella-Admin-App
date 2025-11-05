import { IonIcon } from "@ionic/react"
import { person, peopleCircle, arrowForward } from "ionicons/icons"
import { useNavigate } from "react-router-dom"
import styles from "../styles/RecentActivity.module.css"

function RecentActivity({ activities }) {
  const navigate = useNavigate()

  // Helper function to get initials from name
  const getInitials = (name) => {
    const parts = name.split(', ')
    if (parts.length >= 2) {
      const lastName = parts[0]
      const firstName = parts[1]
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className={styles.contentBox}>
      <div className={styles.activityHeader}>
        <h3>Pending Registrations</h3>
        <button 
          className={styles.manageBtn}
          onClick={() => navigate('/homeowners')}
        >
          Manage Homeowners
          <IonIcon icon={arrowForward} />
        </button>
      </div>
      
      {activities.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <IonIcon icon={peopleCircle} />
          </div>
          <div className={styles.emptyTitle}>No Pending Registrations</div>
          <p className={styles.emptyText}>
            No new user registrations to review at the moment.
          </p>
        </div>
      ) : (
        <div className={styles.activityList}>
          {activities.map((activity, index) => (
            <div key={index} className={styles.activityItem}>
              <div className={styles.activityAvatar}>
                {getInitials(activity.name)}
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityName}>{activity.name}</div>
                <div className={styles.activityMeta}>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
              <span className={styles.statusBadge}>Pending Review</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentActivity