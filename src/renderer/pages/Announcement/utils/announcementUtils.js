// Updated utility functions for announcement management
// src/renderer/pages/Announcement/utils/announcementUtils.jsx

import { announcementService } from '../../../services/announcementService'
import { storageService } from '../../../services/storageService'

// Helper function to convert database row to frontend format
export const formatAnnouncementData = (dbAnnouncement) => {
  return {
    id: dbAnnouncement.id,
    title: dbAnnouncement.title,
    content: dbAnnouncement.content,
    category: dbAnnouncement.category,
    status: dbAnnouncement.status,
    createdAt: new Date(dbAnnouncement.created_at),
    publishedAt: dbAnnouncement.published_at ? new Date(dbAnnouncement.published_at) : null,
    views: dbAnnouncement.views || 0,
    image: dbAnnouncement.image_url
  }
}

// Convert frontend data to database format
export const formatForDatabase = (formData) => {
  const dbData = {
    title: formData.title,
    content: formData.content,
    category: formData.category,
    image_url: formData.image || null
  }

  // Handle publishing options
  if (formData.publishOption === 'draft') {
    dbData.status = 'draft'
    dbData.published_at = null
  } else if (formData.publishOption === 'schedule') {
    dbData.status = 'published'
    dbData.published_at = new Date(formData.scheduledDate).toISOString()
  } else {
    dbData.status = 'published'
    dbData.published_at = new Date().toISOString()
  }

  return dbData
}

export const getFilteredAnnouncements = (announcements, searchTerm, filterCategory, filterMonth, currentView) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return announcements.filter(ann => {
    // Search filter
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ann.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || ann.category === filterCategory;
    
    // Month filter
    const matchesMonth = filterMonth === 'all' || 
                        (ann.createdAt && months[ann.createdAt.getMonth()] === filterMonth);
    
    // View filter - MOST IMPORTANT
    let matchesView = false;
    
    if (currentView === 'archived') {
      // Archived view: ONLY show archived announcements
      matchesView = ann.status === 'archived';
    } else if (currentView === 'drafts') {
      // Drafts view: ONLY show draft announcements
      matchesView = ann.status === 'draft';
    } else {
      // Active view (list): show published and scheduled, exclude archived and draft
      matchesView = ann.status !== 'archived' && ann.status !== 'draft';
    }
    
    return matchesSearch && matchesCategory && matchesMonth && matchesView;
  });
};

export const getStatusBadge = (announcement) => {
  if (announcement.status === 'draft') return 'draft';
  if (announcement.status === 'archived') return 'archived';
  if (announcement.publishedAt && announcement.publishedAt > new Date()) return 'scheduled';
  return 'published';
};

export const formatDate = (date) => {
  return date ? date.toLocaleDateString() : 'Not set';
};

export const getStats = (announcements) => {
  const total = announcements.length;
  const published = announcements.filter(a => a.status === 'published').length;
  const drafts = announcements.filter(a => a.status === 'draft').length;
  const archived = announcements.filter(a => a.status === 'archived').length;
  const totalViews = announcements.reduce((sum, ann) => sum + ann.views, 0);
  const avgViews = total > 0 ? Math.round(totalViews / total) : 0;
  
  return { total, published, drafts, archived, totalViews, avgViews };
};

export const getInitialFormData = () => {
  return {
    title: '',
    content: '',
    category: 'Announcement',
    image: null,
    publishOption: 'now',
    scheduledDate: ''
  };
};

// Database operations wrapped in utils
export const dbOperations = {
  // Load all announcements
  loadAnnouncements: async () => {
    try {
      console.log('dbOperations.loadAnnouncements called');
      const { data, error } = await announcementService.getAnnouncements()
      
      if (error) {
        console.error('Error loading announcements:', error)
        return { data: [], error }
      }
      
      const formattedData = (data || []).map(formatAnnouncementData)
      console.log(`Formatted ${formattedData.length} announcements`);
      return { data: formattedData, error: null }
    } catch (error) {
      console.error('Exception in loadAnnouncements:', error)
      return { data: [], error }
    }
  },

  // Create new announcement
  createAnnouncement: async (formData) => {
    try {
      console.log('dbOperations.createAnnouncement called with:', formData);
      const dbData = formatForDatabase(formData)
      const { data, error } = await announcementService.createAnnouncement(dbData)
      
      if (error) {
        console.error('Error creating announcement:', error)
        return { data: null, error }
      }
      
      const formattedData = formatAnnouncementData(data)
      console.log('Created announcement:', formattedData);
      return { data: formattedData, error: null }
    } catch (error) {
      console.error('Exception in createAnnouncement:', error)
      return { data: null, error }
    }
  },

  // Update existing announcement
  updateAnnouncement: async (id, formData, existingImageUrl = null) => {
    try {
      console.log('dbOperations.updateAnnouncement called with:', { id, formData });
      
      // Handle image changes
      let finalImageUrl = formData.image;
      
      // If the image was removed (set to null) and there was an existing image, delete it
      if (formData.image === null && existingImageUrl) {
        try {
          await storageService.deleteImage(existingImageUrl);
          console.log('Deleted old image:', existingImageUrl);
        } catch (deleteError) {
          console.warn('Failed to delete old image:', deleteError);
          // Continue with update even if delete fails
        }
      }
      
      const dbData = formatForDatabase(formData)
      const { data, error } = await announcementService.updateAnnouncement(id, dbData)
      
      if (error) {
        console.error('Error updating announcement:', error)
        return { data: null, error }
      }
      
      const formattedData = formatAnnouncementData(data)
      console.log('Updated announcement:', formattedData);
      return { data: formattedData, error: null }
    } catch (error) {
      console.error('Exception in updateAnnouncement:', error)
      return { data: null, error }
    }
  },

  // Archive announcement
  archiveAnnouncement: async (id) => {
    try {
      console.log('dbOperations.archiveAnnouncement called with id:', id);
      const { data, error } = await announcementService.archiveAnnouncement(id)
      
      if (error) {
        console.error('Error archiving announcement:', error)
        return { data: null, error }
      }
      
      const formattedData = formatAnnouncementData(data)
      console.log('Archived announcement:', formattedData);
      return { data: formattedData, error: null }
    } catch (error) {
      console.error('Exception in archiveAnnouncement:', error)
      return { data: null, error }
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id, imageUrl = null) => {
    try {
      console.log('dbOperations.deleteAnnouncement called with id:', id);
      
      // First delete the associated image if it exists
      if (imageUrl) {
        try {
          await storageService.deleteImage(imageUrl);
          console.log('Deleted associated image:', imageUrl);
        } catch (imageError) {
          console.warn('Failed to delete associated image:', imageError);
          // Continue with announcement deletion even if image deletion fails
        }
      }
      
      const { data, error } = await announcementService.deleteAnnouncement(id)
      
      if (error) {
        console.error('Error deleting announcement:', error)
        return { data: null, error }
      }
      
      const formattedData = formatAnnouncementData(data)
      console.log('Deleted announcement:', formattedData);
      return { data: formattedData, error: null }
    } catch (error) {
      console.error('Exception in deleteAnnouncement:', error)
      return { data: null, error }
    }
  },

  // Increment views
  incrementViews: async (id) => {
    try {
      console.log('dbOperations.incrementViews called with id:', id);
      const { error } = await announcementService.incrementViews(id)
      
      if (error) {
        console.error('Error incrementing views:', error)
        // Don't return error for view increment, it's not critical
      } else {
        console.log('Views incremented successfully');
      }
    } catch (error) {
      console.error('Exception in incrementViews:', error)
      // Don't throw error for view increment
    }
  }
}