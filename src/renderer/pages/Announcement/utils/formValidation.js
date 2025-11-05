// Form validation utilities
export const validateAnnouncementForm = (formData) => {
  const errors = {}
  
  // Validate title
  if (!formData.title.trim()) {
    errors.title = "Title is required"
  }
  
  // Validate content
  if (!formData.content.trim()) {
    errors.content = "Content is required"
  }
  
  // Validate category
  if (!formData.category) {
    errors.category = "Category is required"
  }
  
  // Validate scheduled date if schedule option is selected
  if (formData.publishOption === "schedule") {
    if (!formData.scheduledDate) {
      errors.scheduledDate = "Please select a date and time for scheduling"
    } else {
      const selectedDate = new Date(formData.scheduledDate)
      const now = new Date()
      if (selectedDate <= now) {
        errors.scheduledDate = "Scheduled date must be in the future"
      }
    }
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  }
}

// Initialize form data
export const getInitialFormData = () => ({
  title: "",
  content: "",
  category: "",
  image: "",
  publishOption: "now",
  scheduledDate: "",
  scheduledTime: "",
})

// Format form data for editing
export const formatEditingData = (announcement) => ({
  title: announcement.title || "",
  content: announcement.content || "",
  category: announcement.category || "",
  image: announcement.image || "",
  publishOption: announcement.status === "draft" ? "draft" : "now",
  scheduledDate: announcement.publishedAt
    ? announcement.publishedAt.toISOString().slice(0, 10)
    : "",
  scheduledTime: announcement.publishedAt
    ? announcement.publishedAt.toISOString().slice(11, 16)
    : "",
})