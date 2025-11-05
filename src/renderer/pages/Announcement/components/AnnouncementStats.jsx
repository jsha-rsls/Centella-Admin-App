import { useState, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import styles from '../styles/AnnouncementStats.module.css';
import { 
  IoArrowBack, 
  IoBarChartOutline, 
  IoCheckmarkDoneOutline, 
  IoCreateOutline, 
  IoArchiveOutline, 
  IoEyeOutline, 
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoPieChartOutline
} from "react-icons/io5";

// Move sanitization config outside component
const STRIP_HTML_CONFIG = { 
  ALLOWED_TAGS: [],
  KEEP_CONTENT: true
};

// Helper function to strip HTML and get plain text (outside component)
const stripHtml = (html) => {
  if (typeof window !== 'undefined' && html) {
    const clean = DOMPurify.sanitize(html, STRIP_HTML_CONFIG);
    // Create a temporary element to decode HTML entities
    const temp = document.createElement('div');
    temp.innerHTML = clean;
    return temp.textContent || temp.innerText || 'Untitled';
  }
  return html || 'Untitled';
};

export const AnnouncementStats = ({ 
  onBack, 
  announcements,
  getStats 
}) => {
  const [dateFilter, setDateFilter] = useState('all');
  
  // Memoize stats calculation
  const stats = useMemo(() => getStats(), [getStats]);

  // Memoize percentage calculations
  const percentages = useMemo(() => ({
    published: stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0,
    drafts: stats.total > 0 ? Math.round((stats.drafts / stats.total) * 100) : 0,
    archived: stats.total > 0 ? Math.round((stats.archived / stats.total) * 100) : 0
  }), [stats.total, stats.published, stats.drafts, stats.archived]);

  // Memoize category breakdown
  const categoryStats = useMemo(() => 
    announcements.reduce((acc, ann) => {
      acc[ann.category] = (acc[ann.category] || 0) + 1;
      return acc;
    }, {}),
    [announcements]
  );

  // Memoize category view stats
  const categoryViewStats = useMemo(() => 
    announcements.reduce((acc, ann) => {
      acc[ann.category] = (acc[ann.category] || 0) + ann.views;
      return acc;
    }, {}),
    [announcements]
  );

  // Memoize sorted category entries
  const sortedCategoryStats = useMemo(() => 
    Object.entries(categoryStats).sort(([,a], [,b]) => b - a),
    [categoryStats]
  );

  const sortedCategoryViewStats = useMemo(() => 
    Object.entries(categoryViewStats).sort(([,a], [,b]) => b - a),
    [categoryViewStats]
  );

  // Memoize sorted announcements by views
  const sortedAnnouncements = useMemo(() => 
    [...announcements].sort((a, b) => b.views - a.views),
    [announcements]
  );

  // Memoize max views for progress bar calculation
  const maxViews = useMemo(() => 
    Math.max(...announcements.map(a => a.views), 1), // Ensure minimum of 1 to avoid division by zero
    [announcements]
  );

  // Memoize event handlers
  const handleDateFilterChange = useCallback((e) => {
    setDateFilter(e.target.value);
  }, []);

  return (
    <div className={styles.announcement}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={onBack}
        >
          <IoArrowBack size={18} /> Back to Announcements
        </button>
        <div className={styles.headerTop}>
          <h1>Statistics Dashboard</h1>
          <div className={styles.dateFilter}>
            <IoCalendarOutline size={18} />
            <select 
              value={dateFilter} 
              onChange={handleDateFilterChange}
              className={styles.filterSelect}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.statsContainer}>
        {/* Overview Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardNeutral}`}>
            <div className={styles.statIcon}><IoBarChartOutline size={22} /></div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>Total Announcements</div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardSuccess}`}>
            <div className={styles.statIcon}><IoCheckmarkDoneOutline size={22} /></div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>
                {stats.published}
                <span className={styles.statPercent}>{percentages.published}%</span>
              </div>
              <div className={styles.statLabel}>Published</div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardWarning}`}>
            <div className={styles.statIcon}><IoCreateOutline size={22} /></div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>
                {stats.drafts}
                <span className={styles.statPercent}>{percentages.drafts}%</span>
              </div>
              <div className={styles.statLabel}>Drafts</div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardMuted}`}>
            <div className={styles.statIcon}><IoArchiveOutline size={22} /></div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>
                {stats.archived}
                <span className={styles.statPercent}>{percentages.archived}%</span>
              </div>
              <div className={styles.statLabel}>Archived</div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
            <div className={styles.statIcon}><IoEyeOutline size={22} /></div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{stats.totalViews}</div>
              <div className={styles.statLabel}>Total Views</div>
            </div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statCardInfo}`}>
            <div className={styles.statIcon}><IoTrendingUpOutline size={22} /></div>
            <div className={styles.statInfo}>
              <div className={styles.statNumber}>{stats.avgViews}</div>
              <div className={styles.statLabel}>Avg Views</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className={styles.chartsGrid}>
          {/* Category Breakdown */}
          <div className={styles.chartCard}>
            <h3><IoPieChartOutline size={20} /> By Category</h3>
            <div className={styles.categoryList}>
              {sortedCategoryStats.map(([category, count]) => (
                <div key={category} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.categoryCount}>{count} announcements</span>
                  </div>
                  <div className={styles.categoryStats}>
                    <div className={styles.categoryBar}>
                      <div 
                        className={styles.categoryProgress}
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className={styles.categoryPercent}>
                      {Math.round((count / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Views by Category */}
          <div className={styles.chartCard}>
            <h3><IoEyeOutline size={20} /> Views by Category</h3>
            <div className={styles.categoryList}>
              {sortedCategoryViewStats.map(([category, views]) => (
                <div key={category} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.categoryCount}>
                      {Math.round(views / categoryStats[category])} avg views
                    </span>
                  </div>
                  <div className={styles.categoryStats}>
                    <div className={styles.categoryBar}>
                      <div 
                        className={styles.categoryProgress}
                        style={{ width: `${(views / stats.totalViews) * 100}%` }}
                      ></div>
                    </div>
                    <span className={styles.categoryPercent}>{views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Individual Announcements */}
        <div className={styles.viewsChart}>
          <h3><IoBarChartOutline size={20} /> Individual Announcements</h3>
          <div className={styles.viewsList}>
            {sortedAnnouncements.map(ann => (
              <div key={ann.id} className={styles.viewItem}>
                <div className={styles.viewItemInfo}>
                  <span className={styles.viewTitle}>{stripHtml(ann.title)}</span>
                  <span className={styles.viewCategory}>
                    {ann.category} • {ann.status}
                  </span>
                </div>
                <div className={styles.viewStats}>
                  <div className={styles.viewBar}>
                    <div 
                      className={styles.viewProgress}
                      style={{ width: `${(ann.views / maxViews) * 100}%` }}
                    ></div>
                  </div>
                  <span className={styles.viewCount}>{ann.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};