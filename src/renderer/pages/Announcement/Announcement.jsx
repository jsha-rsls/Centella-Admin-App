import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { addOutline, archiveOutline, listOutline, statsChartOutline, checkmarkCircleOutline, closeCircleOutline, documentTextOutline } from 'ionicons/icons';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './Announcement.module.css';

// Updated imports to use the new structure
import { CreateEditModal } from './components';
import { ViewModal } from './components/modals/ViewModal';
import { AnnouncementCard } from './components/AnnouncementCard';
import { AnnouncementFilters } from './components/AnnouncementFilters';
import { AnnouncementStats } from './components/AnnouncementStats';
import { Toast, ToastContainer } from './components/ToastNotification';
import AlertModal from './components/modals/AlertModal';
import { useToast } from './hooks/useToast';

import { 
  getFilteredAnnouncements,
  getStatusBadge,
  formatDate,
  getStats,
  dbOperations
} from './utils/announcementUtils';

import { useAuth } from '../../utils/AuthContext';

// Helper function to strip HTML tags for display in alerts
const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

function Announcement() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // New states for batch selection
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Alert Modal state
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: true,
    onConfirm: null
  });

  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();

  const categories = ['Announcement', 'Updates', 'Alerts'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const userId = useMemo(() => user?.id, [user]);
  const hasLoadedRef = useRef(false);
  const hasOpenedAnnouncementRef = useRef(false);

  // Calculate draft count
  const draftCount = useMemo(() => {
    return announcements.filter(ann => ann.status === 'draft').length;
  }, [announcements]);

  // Generic function to show alert
  const showAlert = useCallback((config) => {
    setAlertConfig({
      isOpen: true,
      title: config.title || 'hoa',
      message: config.message || '',
      type: config.type || 'warning',
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      showCancel: config.showCancel !== false,
      onConfirm: config.onConfirm || null
    });
  }, []);

  // Close alert
  const closeAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Load announcements once per login
  const loadAnnouncements = useCallback(async () => {
    if (!userId) return;

    console.log("dbOperations.loadAnnouncements called");
    setLoading(true);
    try {
      const { data, error } = await dbOperations.loadAnnouncements();
      if (error) throw error;

      setAnnouncements(data || []);
      console.log("📢 Announcements loaded:", data?.length || 0);
    } catch (err) {
      console.error("Error loading announcements:", err);
      showError("Error", "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [userId, showError]);

  // Effect: only run once after login
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAnnouncements([]);
      hasLoadedRef.current = false;
      return;
    }

    if (!hasLoadedRef.current) {
      loadAnnouncements();
      hasLoadedRef.current = true;
    }
  }, [authLoading, user, loadAnnouncements]);

  // Effect: Auto-open announcement if navigated from Overview
  useEffect(() => {
    if (
      !loading && 
      !authLoading && 
      announcements.length > 0 && 
      location.state?.openAnnouncementId &&
      !hasOpenedAnnouncementRef.current
    ) {
      const announcementToOpen = announcements.find(
        ann => ann.id === location.state.openAnnouncementId
      );
      
      if (announcementToOpen) {
        handleView(announcementToOpen);
        hasOpenedAnnouncementRef.current = true;
        
        window.history.replaceState({}, document.title);
      }
    }
  }, [loading, authLoading, announcements, location.state]);

  // Reset the ref when view modal closes
  useEffect(() => {
    if (!showViewModal) {
      hasOpenedAnnouncementRef.current = false;
    }
  }, [showViewModal]);

  // ---- Batch Selection Handlers ----
  const handleToggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedIds([]); // Clear selections when toggling mode
  };

  const handleSelectAnnouncement = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAnnouncements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAnnouncements.map(a => a.id));
    }
  };

  const handleBatchArchive = async () => {
    showAlert({
      title: 'hoa',
      message: `Archive ${selectedIds.length} announcement(s)?`,
      type: 'warning',
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const promises = selectedIds.map(id => dbOperations.archiveAnnouncement(id));
          const results = await Promise.all(promises);
          
          const errors = results.filter(r => r.error);
          if (errors.length > 0) {
            throw new Error(`Failed to archive ${errors.length} announcement(s)`);
          }

          // Update local state
          setAnnouncements(prev => prev.map(ann => 
            selectedIds.includes(ann.id) ? { ...ann, status: 'archived' } : ann
          ));

          showSuccess('Archived', `${selectedIds.length} announcement(s) archived successfully.`);
          setSelectedIds([]);
          setSelectMode(false);
        } catch (err) {
          showError('Archive Failed', err.message || 'Something went wrong.');
          console.error(err);
        }
      }
    });
  };

  const handleBatchDelete = async () => {
    showAlert({
      title: 'hoa',
      message: `Delete ${selectedIds.length} announcement(s) permanently? This cannot be undone.`,
      type: 'danger',
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const promises = selectedIds.map(id => {
            const announcement = announcements.find(a => a.id === id);
            return dbOperations.deleteAnnouncement(id, announcement?.image);
          });
          const results = await Promise.all(promises);
          
          const errors = results.filter(r => r.error);
          if (errors.length > 0) {
            throw new Error(`Failed to delete ${errors.length} announcement(s)`);
          }

          // Update local state
          setAnnouncements(prev => prev.filter(ann => !selectedIds.includes(ann.id)));

          showError('Deleted', `${selectedIds.length} announcement(s) deleted successfully.`);
          setSelectedIds([]);
          setSelectMode(false);
        } catch (err) {
          showError('Delete Failed', err.message || 'Something went wrong.');
          console.error(err);
        }
      }
    });
  };

  const handleBatchUnarchive = async () => {
    showAlert({
      title: 'hoa',
      message: `Unarchive ${selectedIds.length} announcement(s)?`,
      type: 'info',
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const promises = selectedIds.map(id => {
            const announcement = announcements.find(a => a.id === id);
            return dbOperations.updateAnnouncement(id, {
              ...announcement,
              publishOption: 'now'
            });
          });
          const results = await Promise.all(promises);
          
          const errors = results.filter(r => r.error);
          if (errors.length > 0) {
            throw new Error(`Failed to unarchive ${errors.length} announcement(s)`);
          }

          // Update local state
          setAnnouncements(prev => prev.map(ann => {
            if (selectedIds.includes(ann.id)) {
              const result = results.find(r => r.data?.id === ann.id);
              return result?.data || ann;
            }
            return ann;
          }));

          showSuccess('Restored', `${selectedIds.length} announcement(s) restored successfully.`);
          setSelectedIds([]);
          setSelectMode(false);
        } catch (err) {
          showError('Unarchive Failed', err.message || 'Something went wrong.');
          console.error(err);
        }
      }
    });
  };

  const handleBatchDraft = async () => {
    showAlert({
      title: 'hoa',
      message: `Save ${selectedIds.length} announcement(s) as draft?`,
      type: 'info',
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const promises = selectedIds.map(id => {
            const announcement = announcements.find(a => a.id === id);
            return dbOperations.updateAnnouncement(id, {
              ...announcement,
              publishOption: 'draft',
              status: 'draft'
            });
          });
          const results = await Promise.all(promises);
          
          const errors = results.filter(r => r.error);
          if (errors.length > 0) {
            throw new Error(`Failed to save ${errors.length} announcement(s) as draft`);
          }

          // Update local state
          setAnnouncements(prev => prev.map(ann => {
            if (selectedIds.includes(ann.id)) {
              const result = results.find(r => r.data?.id === ann.id);
              return result?.data || ann;
            }
            return ann;
          }));

          showInfo('Saved as Draft', `${selectedIds.length} announcement(s) saved as draft.`);
          setSelectedIds([]);
          setSelectMode(false);
        } catch (err) {
          showError('Draft Failed', err.message || 'Something went wrong.');
          console.error(err);
        }
      }
    });
  };

  const handleBatchPublish = async () => {
    showAlert({
      title: 'hoa',
      message: `Publish ${selectedIds.length} draft(s)?`,
      type: 'info',
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const promises = selectedIds.map(id => {
            const announcement = announcements.find(a => a.id === id);
            return dbOperations.updateAnnouncement(id, {
              ...announcement,
              publishOption: 'now'
            });
          });
          const results = await Promise.all(promises);
          
          const errors = results.filter(r => r.error);
          if (errors.length > 0) {
            throw new Error(`Failed to publish ${errors.length} draft(s)`);
          }

          // Update local state
          setAnnouncements(prev => prev.map(ann => {
            if (selectedIds.includes(ann.id)) {
              const result = results.find(r => r.data?.id === ann.id);
              return result?.data || ann;
            }
            return ann;
          }));

          showSuccess('Published', `${selectedIds.length} draft(s) published successfully.`);
          setSelectedIds([]);
          setSelectMode(false);
        } catch (err) {
          showError('Publish Failed', err.message || 'Something went wrong.');
          console.error(err);
        }
      }
    });
  };

  // ---- CRUD handlers ----
  const handleSubmit = async (formData) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (editingAnnouncement) {
        const { data, error } = await dbOperations.updateAnnouncement(editingAnnouncement.id, formData);
        if (error) throw error;
        setAnnouncements(prev => prev.map(ann => ann.id === editingAnnouncement.id ? data : ann));
        showSuccess('Updated!', 'Announcement changes saved.');
      } else {
        const { data, error } = await dbOperations.createAnnouncement(formData);
        if (error) throw error;
        setAnnouncements(prev => [data, ...prev]);

        if (formData.publishOption === 'draft') showInfo('Saved as Draft', 'You can publish later.');
        else if (formData.publishOption === 'schedule') showSuccess('Scheduled!', 'Announcement scheduled.');
        else showSuccess('Created!', 'Announcement published.');
      }

      setShowModal(false);
      setEditingAnnouncement(null);
    } catch (err) {
      showError('Failed', 'Something went wrong.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowModal(true);
  };

  const handleView = async (announcement) => {
    setViewingAnnouncement(announcement);
    setShowViewModal(true);

    await dbOperations.incrementViews(announcement.id);
    setAnnouncements(prev => prev.map(ann => ann.id === announcement.id ? { ...ann, views: ann.views + 1 } : ann));
  };

  const handleDelete = async (id) => {
    const announcement = announcements.find(ann => ann.id === id);
    const titleText = stripHtmlTags(announcement?.title);
    
    showAlert({
      title: 'hoa',
      message: `Delete "${titleText}" permanently?`,
      type: 'danger',
      confirmText: 'OK',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const { error } = await dbOperations.deleteAnnouncement(id);
          if (error) throw error;
          setAnnouncements(prev => prev.filter(ann => ann.id !== id));
          showError('Deleted', `"${titleText}" has been removed.`);
        } catch (err) {
          showError('Delete Failed', 'Something went wrong.');
        }
      }
    });
  };

  const handleArchive = async (id) => {
    const announcement = announcements.find(ann => ann.id === id);
    try {
      const { data, error } = await dbOperations.archiveAnnouncement(id);
      if (error) throw error;
      setAnnouncements(prev => prev.map(ann => ann.id === id ? data : ann));
      showWarning('Archived', `"${stripHtmlTags(announcement?.title)}" moved to archive.`);
    } catch (err) {
      showError('Archive Failed', 'Something went wrong.');
    }
  };

  const handleUnarchive = async (id) => {
    const announcement = announcements.find(ann => ann.id === id);
    try {
      const { data, error } = await dbOperations.updateAnnouncement(id, {
        ...announcement,
        publishOption: 'now'
      });
      if (error) throw error;
      setAnnouncements(prev => prev.map(ann => ann.id === id ? data : ann));
      showSuccess('Restored', `"${stripHtmlTags(announcement?.title)}" is now active.`);
    } catch (err) {
      showError('Unarchive Failed', 'Something went wrong.');
    }
  };

  const handlePublishDraft = async (id) => {
    const announcement = announcements.find(ann => ann.id === id);
    try {
      const { data, error } = await dbOperations.updateAnnouncement(id, {
        ...announcement,
        publishOption: 'now'
      });
      if (error) throw error;
      setAnnouncements(prev => prev.map(ann => ann.id === id ? data : ann));
      showSuccess('Published', `"${stripHtmlTags(announcement?.title)}" is now active.`);
    } catch (err) {
      showError('Publish Failed', 'Something went wrong.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingAnnouncement(null);
  };

  const filteredAnnouncements = getFilteredAnnouncements(
    announcements, searchTerm, filterCategory, filterMonth, currentView
  );

  // Get header title and description based on current view
  const getViewTitle = () => {
    switch(currentView) {
      case 'archived':
        return 'Archived Announcements';
      case 'drafts':
        return 'Draft Announcements';
      default:
        return 'Active Announcements';
    }
  };

  const getViewDescription = () => {
    switch(currentView) {
      case 'archived':
        return 'View archived announcements';
      case 'drafts':
        return 'Manage draft announcements';
      default:
        return 'Manage community announcements';
    }
  };

  // ---- Render ----
  if (authLoading || loading) {
    return (
      <div className={styles.announcement}>
        {/* Header Skeleton */}
        <div className={styles.header}>
          <div>
            <Skeleton width={200} height={32} style={{ marginBottom: '8px' }} />
            <Skeleton width={280} height={20} />
          </div>
          <div className={styles.headerActions}>
            <Skeleton width={100} height={40} borderRadius={8} style={{ marginRight: '8px' }} />
            <Skeleton width={100} height={40} borderRadius={8} style={{ marginRight: '8px' }} />
            <Skeleton width={100} height={40} borderRadius={8} style={{ marginRight: '8px' }} />
            <Skeleton width={100} height={40} borderRadius={8} style={{ marginRight: '8px' }} />
            <Skeleton width={100} height={40} borderRadius={8} />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1.5px solid #E8D4D4',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '12px'
          }}>
            <Skeleton height={44} borderRadius={8} />
            <Skeleton height={44} borderRadius={8} />
            <Skeleton height={44} borderRadius={8} />
          </div>
        </div>

        {/* Announcement Cards Skeleton */}
        <div className={styles.announcementsList}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1.5px solid #E8D4D4',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <Skeleton width={250} height={24} style={{ marginBottom: '8px' }} />
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Skeleton width={80} height={20} borderRadius={12} />
                    <Skeleton width={100} height={16} />
                    <Skeleton width={60} height={16} />
                  </div>
                </div>
                <Skeleton width={32} height={32} circle />
              </div>
              <Skeleton count={2} style={{ marginBottom: '12px' }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #E8D4D4'
              }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Skeleton width={60} height={16} />
                  <Skeleton width={60} height={16} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton width={80} height={32} borderRadius={6} />
                  <Skeleton width={80} height={32} borderRadius={6} />
                  <Skeleton width={32} height={32} borderRadius={6} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.announcement}>
        <div className={styles.loadingState}>
          <p>Please log in to view announcements.</p>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  if (currentView === 'stats') {
    return (
      <>
        <AnnouncementStats 
          onBack={() => setCurrentView('list')}
          announcements={announcements}
          getStats={() => getStats(announcements)}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <div className={styles.announcement}>
      <div className={styles.header}>
        <div>
          <h1>{getViewTitle()}</h1>
          <p>{getViewDescription()}</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setCurrentView('stats')} className={styles.statsButton}>
            <IonIcon icon={statsChartOutline} />
            <span className={styles.statsButtonText}>Stats</span>
          </button>
          <button 
            onClick={() => setCurrentView(currentView === 'drafts' ? 'list' : 'drafts')}
            className={currentView === 'drafts' ? styles.draftsViewButtonActive : styles.draftsViewButton}
          >
            <IonIcon icon={currentView === 'drafts' ? listOutline : documentTextOutline} />
            <span className={styles.draftsButtonText}>
              {currentView === 'drafts' ? 'Active' : `Drafts ${draftCount > 0 ? `(${draftCount})` : ''}`}
            </span>
          </button>
          <button 
            onClick={() => setCurrentView(currentView === 'archived' ? 'list' : 'archived')}
            className={currentView === 'archived' ? styles.archiveViewButtonActive : styles.archiveViewButton}
          >
            {currentView === 'archived' ? <IonIcon icon={listOutline} /> : <IonIcon icon={archiveOutline} />}
            <span className={styles.archiveButtonText}>
              {currentView === 'archived' ? 'Active' : 'Archive'}
            </span>
          </button>
          <button 
            onClick={handleToggleSelectMode}
            className={selectMode ? styles.selectModeActive : styles.selectModeButton}
          >
            <IonIcon icon={selectMode ? closeCircleOutline : checkmarkCircleOutline} />
            <span className={styles.selectButtonText}>
              {selectMode ? 'Cancel' : 'Select'}
            </span>
          </button>
          <button onClick={() => setShowModal(true)} className={styles.createButton}>
            <IonIcon icon={addOutline} />
            <span className={styles.createButtonText}>Create</span>
          </button>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectMode && selectedIds.length > 0 && (
        <div className={styles.batchToolbar}>
          <div className={styles.batchToolbarLeft}>
            <span className={styles.batchCount}>
              {selectedIds.length} selected
            </span>
            <button onClick={handleSelectAll} className={styles.selectAllButton}>
              {selectedIds.length === filteredAnnouncements.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className={styles.batchToolbarRight}>
            {currentView === 'drafts' && (
              <button onClick={handleBatchPublish} className={styles.batchPublishButton}>
                <IonIcon icon={checkmarkCircleOutline} />
                Publish Selected
              </button>
            )}
            {currentView === 'archived' && (
              <button onClick={handleBatchUnarchive} className={styles.batchUnarchiveButton}>
                <IonIcon icon={listOutline} />
                Unarchive Selected
              </button>
            )}
            {currentView === 'list' && (
              <>
                <button onClick={handleBatchDraft} className={styles.batchDraftButton}>
                  <IonIcon icon={documentTextOutline} />
                  Draft Selected
                </button>
                <button onClick={handleBatchArchive} className={styles.batchArchiveButton}>
                  <IonIcon icon={archiveOutline} />
                  Archive Selected
                </button>
              </>
            )}
            <button onClick={handleBatchDelete} className={styles.batchDeleteButton}>
              <IonIcon icon={archiveOutline} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <AnnouncementFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        filterMonth={filterMonth}
        onMonthChange={setFilterMonth}
        categories={categories}
        months={months}
      />

      <div className={styles.announcementsList}>
        {filteredAnnouncements.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {currentView === 'archived' ? (
                <IonIcon icon={archiveOutline} />
              ) : currentView === 'drafts' ? (
                <IonIcon icon={documentTextOutline} />
              ) : (
                <IonIcon icon={listOutline} />
              )}
            </div>
            <h3>
              {currentView === 'archived' 
                ? 'No archived announcements' 
                : currentView === 'drafts'
                ? 'No draft announcements'
                : 'No announcements found'}
            </h3>
            <p>
              {currentView === 'archived' 
                ? 'Archived announcements will appear here' 
                : currentView === 'drafts'
                ? 'Draft announcements will appear here. Create one and save as draft!'
                : 'Create your first announcement or adjust filters'}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onView={handleView}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
              onPublish={handlePublishDraft}
              currentView={currentView}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              // Batch selection props
              selectMode={selectMode}
              isSelected={selectedIds.includes(announcement.id)}
              onSelect={handleSelectAnnouncement}
            />
          ))
        )}
      </div>

      <CreateEditModal
        showModal={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingAnnouncement={editingAnnouncement}
        categories={categories}
        submitting={submitting}
        onImageUpload={(imageData) => {
          if (editingAnnouncement) {
            setEditingAnnouncement(prev => prev ? { ...prev, image: imageData } : prev);
          }
        }}
      />

      <ViewModal
        showViewModal={showViewModal}
        onClose={closeViewModal}
        viewingAnnouncement={viewingAnnouncement}
        formatDate={formatDate}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Announcement;