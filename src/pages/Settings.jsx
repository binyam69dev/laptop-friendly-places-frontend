import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Lock, Save, Eye, EyeOff, Loader2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Settings = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateProfile, isLoading } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [isAuthenticated, navigate, user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate passwords match if changing password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    // Validate password length
    if (formData.newPassword && formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const updates = {}
      
      // Only include fields that have changed
      if (formData.name !== user?.name) {
        updates.name = formData.name
      }
      
      if (formData.email !== user?.email) {
        updates.email = formData.email
      }
      
      // If changing password, include current password for verification
      if (formData.newPassword) {
        updates.currentPassword = formData.currentPassword
        updates.newPassword = formData.newPassword
      }
      
      // Skip if no changes
      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save')
        setLoading(false)
        return
      }
      
      const result = await updateProfile(updates)
      
      if (result.success) {
        toast.success('Profile updated successfully!')
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const labelClass = isDarkMode ? 'text-gray-300' : 'text-gray-700'
  const inputClass = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-500'

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className={`${bgClass} min-h-screen py-8`}>
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${textClass}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Settings Form */}
        <div className={`${cardClass} rounded-2xl shadow-lg p-8`}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
              {user.name?.[0] || user.email?.[0] || 'U'}
            </div>
            <h1 className={`${textClass} text-2xl font-bold`}>Settings</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Manage your account settings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Information Section */}
            <div>
              <h2 className={`${textClass} text-lg font-semibold mb-4`}>Profile Information</h2>
              
              {/* Name Field */}
              <div className="mb-4">
                <label className={`${labelClass} block text-sm font-medium mb-2`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${inputClass} w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition`}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className={`${labelClass} block text-sm font-medium mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputClass} w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="border-t pt-6">
              <h2 className={`${textClass} text-lg font-semibold mb-4`}>Change Password</h2>
              
              {/* Current Password */}
              <div className="mb-4">
                <label className={`${labelClass} block text-sm font-medium mb-2`}>
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`${inputClass} w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 outline-none transition`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className={`${labelClass} block text-sm font-medium mb-2`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`${inputClass} w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 outline-none transition`}
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="mb-4">
                <label className={`${labelClass} block text-sm font-medium mb-2`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${inputClass} w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 outline-none transition`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {(loading || isLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings