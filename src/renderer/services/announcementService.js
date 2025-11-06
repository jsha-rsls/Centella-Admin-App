// src/renderer/services/announcementService.js
import { supabase } from "../../utils/supabase"

export const announcementService = {
  // Get all announcements
  getAnnouncements: async () => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error fetching announcements:", error)
      return { data: null, error }
    }
  },

  // Create new announcement
  createAnnouncement: async (announcementData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from("announcements")
        .insert([{
          title: announcementData.title,
          content: announcementData.content,
          category: announcementData.category,
          status: announcementData.status || 'published',
          image_url: announcementData.image_url || null,
          published_at: announcementData.published_at || new Date().toISOString(),
          created_by: user?.id
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error creating announcement:", error)
      return { data: null, error }
    }
  },

  // Update announcement
  updateAnnouncement: async (id, announcementData) => {
    try {
      const updateData = {
        title: announcementData.title,
        content: announcementData.content,
        category: announcementData.category,
        status: announcementData.status,
        image_url: announcementData.image_url
      }

      // Only update published_at if it's provided
      if (announcementData.published_at !== undefined) {
        updateData.published_at = announcementData.published_at
      }

      const { data, error } = await supabase
        .from("announcements")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error updating announcement:", error)
      return { data: null, error }
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error deleting announcement:", error)
      return { data: null, error }
    }
  },

  // Archive announcement (soft delete)
  archiveAnnouncement: async (id) => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .update({ status: 'archived' })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error archiving announcement:", error)
      return { data: null, error }
    }
  },

  // Increment view count
  incrementViews: async (id) => {
    try {
      // Use RPC function for atomic increment
      const { data, error } = await supabase.rpc('increment_views', { 
        announcement_id: id 
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      // Fallback to regular update if RPC function doesn't exist
      console.warn("RPC increment_views not found, using fallback:", error)
      try {
        const { data, error: updateError } = await supabase
          .from("announcements")
          .update({ views: supabase.raw('views + 1') })
          .eq("id", id)
          .select()
          .single()

        if (updateError) throw updateError
        return { data, error: null }
      } catch (fallbackError) {
        console.error("Error incrementing views:", fallbackError)
        return { data: null, error: fallbackError }
      }
    }
  },

  // Get announcements by status
  getAnnouncementsByStatus: async (status) => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error fetching announcements by status:", error)
      return { data: null, error }
    }
  },

  // Get announcements by category
  getAnnouncementsByCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error fetching announcements by category:", error)
      return { data: null, error }
    }
  }
}