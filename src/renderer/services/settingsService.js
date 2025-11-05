// hoa/src/services/settingsService.js
import { supabase } from '../utils/supabaseClient'

const settingsService = {
  /**
   * Update admin profile information
   */
  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .update({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          position: profileData.position,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update admin email (requires re-authentication)
   */
  async updateEmail(newEmail) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating email:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      // First verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) {
        throw new Error('User not found')
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update to new password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error changing password:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('admin_preferences')
        .select('*')
        .eq('admin_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Return default preferences if none exist
      if (!data) {
        return {
          success: true,
          data: {
            emailNotifications: true,
            reservationAlerts: true,
            registrationAlerts: true,
            announcementUpdates: true,
          },
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error getting preferences:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('admin_preferences')
        .upsert({
          admin_id: userId,
          email_notifications: preferences.emailNotifications,
          reservation_alerts: preferences.reservationAlerts,
          registration_alerts: preferences.registrationAlerts,
          announcement_updates: preferences.announcementUpdates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating preferences:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get theme preference
   */
  async getThemePreference(userId) {
    try {
      const { data, error } = await supabase
        .from('admin_preferences')
        .select('theme')
        .eq('admin_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { success: true, data: data?.theme || 'system' }
    } catch (error) {
      console.error('Error getting theme:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update theme preference
   */
  async updateThemePreference(userId, theme) {
    try {
      const { data, error } = await supabase
        .from('admin_preferences')
        .upsert({
          admin_id: userId,
          theme: theme,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating theme:', error)
      return { success: false, error: error.message }
    }
  },
}

export default settingsService