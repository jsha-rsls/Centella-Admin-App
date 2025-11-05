// hoa/src/renderer/services/adminService.js
import { supabase } from "../../utils/supabase"

/**
 * Get the currently logged-in admin's profile (first name, last name, position)
 * @returns {Promise<{firstName: string, lastName: string, position: string} | null>}
 */
export async function getAdminProfile() {
  try {
    // Get the current logged-in user from Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    
    // 🔒 If no user session, return null (not an error - just not logged in)
    if (!user) {
      console.log("ℹ️ No authenticated user session")
      return null
    }

    // Query the admin_accounts table with the user_id from auth
    const { data, error } = await supabase
      .from("admin_accounts")
      .select("first_name, last_name, position")
      .eq("user_id", user.id)
      .single()

    if (error) {
      // If no matching admin account found, return null
      if (error.code === 'PGRST116') {
        console.log("ℹ️ No admin account found for user:", user.id)
        return null
      }
      throw error
    }

    if (data) {
      return {
        firstName: data.first_name,
        lastName: data.last_name,
        position: data.position,
      }
    }

    return null
  } catch (err) {
    console.error("❌ Error fetching admin profile:", err.message)
    return null
  }
}