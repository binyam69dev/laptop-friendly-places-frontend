import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, LogOut, Shield, Edit2, Save, X, Loader2, Camera, Trash2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, updateProfile, isLoading } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      })
      setProfileImage(user.profileImage || null)
    }
  }, [isAuthenticated, navigate, user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    
    setUploadingImage(true)
    
    try {
      const base64 = await convertToBase64(file)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/profile/image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileImage: base64 })
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const updatedUser = await response.json()
      setProfileImage(base64)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      toast.success('Profile picture updated!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeProfileImage = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/profile/image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to remove image')
      
      setProfileImage(null)
      toast.success('Profile picture removed')
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Failed to remove profile picture')
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    
    setSaving(true)
    const result = await updateProfile({ name: formData.name })
    if (result.success) {
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } else {
      toast.error(result.error || 'Failed to update profile')
    }
    setSaving(false)
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-500'

  if (!isAuthenticated || !user) return null

  return (
    <div className={`${bgClass} min-h-screen py-12`}>
      <div className="container mx-auto px-4 max-w-2xl">
        <div className={`${cardClass} rounded-2xl shadow-lg p-8`}>
          {/* Profile Picture Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              {/* Profile Image */}
              <div className="relative group">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-purple-500">
                    {user.name?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                    title="Upload photo"
                  >
                    <Camera className="w-5 h-5 text-gray-700" />
                  </button>
                  {profileImage && (
                    <button
                      onClick={removeProfileImage}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
                      title="Remove photo"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
              
              {uploadingImage && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">Click camera to change photo</p>
          </div>

          {/* User Info Section */}
          <div className="text-center mb-8">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClass} px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none text-center w-full transition`}
                  placeholder="Your name"
                />
                <p className={`${textClass} text-sm`}>{user.email}</p>
              </div>
            ) : (
              <>
                <h1 className={`${textClass} text-2xl font-bold`}>{user.name || 'User'}</h1>
                <p className="text-gray-500 mt-1">{user.email}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Shield className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600 capitalize">{user.role?.toLowerCase() || 'user'}</span>
                </div>
              </>
            )}
          </div>

          {/* User Details */}
          <div className="border-t pt-6 space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <User className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Name</p>
                <p className={`${textClass} font-medium`}>{user.name || 'Not set'}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <Mail className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className={`${textClass} font-medium`}>{user.email}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || isLoading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  {saving || isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({ name: user.name || '', email: user.email || '' })
                  }}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Settings
                </button>
              </>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full mt-3 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile