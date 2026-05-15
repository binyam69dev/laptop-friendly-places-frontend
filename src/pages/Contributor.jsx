import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, MapPin, Wifi, Zap, Coffee, Star, Loader2, CheckCircle, Upload, Image, Video, X, Trash2, Play } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Contributor = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    description: '',
    wifi: 'medium',
    outlets: true,
    coffee_available: true,
    quietness: 3,
    price_range: '$$',
    opening_hours: ''
  })

  useEffect(() => {
    // Check if user is authenticated and has contributor role
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Optional: Check if user has contributor role
    if (user?.role !== 'contributor' && user?.role !== 'admin') {
      toast.info('You need contributor status to add places')
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PlusCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please Login</h2>
          <p className="text-gray-500 mb-4">Login to contribute new places</p>
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-purple-600 text-white rounded-lg">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files)
    const newVideos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setVideos(prev => [...prev, ...newVideos])
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview)
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index) => {
    URL.revokeObjectURL(videos[index].preview)
    setVideos(prev => prev.filter((_, i) => i !== index))
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setUploadProgress(0)
    
    try {
      const token = localStorage.getItem('token')
      const uploadedImages = []
      const uploadedVideos = []
      
      // Upload images to backend or convert to base64
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        setUploadProgress(Math.round(((i + 0.5) / (images.length + videos.length)) * 50))
        try {
          const base64 = await convertToBase64(img.file)
          uploadedImages.push(base64)
        } catch (err) {
          console.error('Image conversion failed:', err)
          uploadedImages.push(img.preview)
        }
      }
      
      // Upload videos to backend or store as base64
      for (let i = 0; i < videos.length; i++) {
        const vid = videos[i]
        setUploadProgress(50 + Math.round(((i + 0.5) / (images.length + videos.length)) * 50))
        try {
          const base64 = await convertToBase64(vid.file)
          uploadedVideos.push(base64)
        } catch (err) {
          console.error('Video conversion failed:', err)
          uploadedVideos.push(vid.preview)
        }
      }
      
      setUploadProgress(100)
      
      // Submit place with media
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/places`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
          videos: uploadedVideos,
          submittedBy: user?.name || user?.email,
          status: 'pending'
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit place')
      }
      
      setSubmitted(true)
      toast.success('Place submitted successfully! Waiting for admin approval.')
      setTimeout(() => {
        navigate('/my-contributions')
      }, 2000)
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(error.message || 'Failed to submit place. Please try again.')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (submitted) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-500">Your place has been submitted for review.</p>
          <p className="text-gray-500 mb-4">We'll notify you once it's approved.</p>
          <button onClick={() => navigate('/my-contributions')} className="px-6 py-2 bg-purple-600 text-white rounded-lg">
            View My Contributions
          </button>
        </div>
      </div>
    )
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-500'

  const labelClass = isDarkMode ? 'text-gray-300' : 'text-gray-700'

  return (
    <div className={`${bgClass} min-h-screen py-8`}>
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <PlusCircle className="w-12 h-12 mx-auto text-purple-600 mb-4" />
          <h1 className={`${textClass} text-3xl font-bold`}>
            Contribute a Place
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Help others find great places to work remotely
          </p>
          {user?.role === 'user' && (
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
              ⚡ Your submissions will need admin approval before being published
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={`${cardClass} rounded-xl shadow-lg p-6`}>
          {/* Basic Info */}
          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Place Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`${inputClass} w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition`}
              placeholder="e.g., Starbucks Downtown"
            />
          </div>

          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Address *</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className={`${inputClass} w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition`}
              placeholder="Street address"
            />
          </div>

          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>City *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className={`${inputClass} w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition`}
              placeholder="City name"
            />
          </div>

          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className={`${inputClass} w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition`}
              placeholder="Describe the atmosphere, seating, etc."
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Photos</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`${cardClass} border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition hover:border-purple-500`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Image className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload photos</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
            </div>
            
            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload Section */}
          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Videos (Optional)</label>
            <div 
              onClick={() => videoInputRef.current?.click()}
              className={`${cardClass} border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition hover:border-purple-500`}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />
              <Video className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload videos</p>
              <p className="text-xs text-gray-400">MP4, WebM, MOV up to 50MB each</p>
            </div>
            
            {/* Video Previews with Play Button */}
            {videos.length > 0 && (
              <div className="mt-3 space-y-2">
                {videos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span className="text-sm flex-1 truncate">{vid.name}</span>
                    <span className="text-xs text-gray-500">{(vid.size / (1024 * 1024)).toFixed(1)} MB</span>
                    <button
                      type="button"
                      onClick={() => {
                        // Preview video in a modal or new tab
                        const videoWindow = window.open()
                        videoWindow.document.write(`
                          <html>
                            <head><title>Video Preview</title></head>
                            <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#000;">
                              <video controls autoplay style="max-width:100%; max-height:100vh;">
                                <source src="${vid.preview}" type="${vid.type}">
                                Your browser does not support the video tag.
                              </video>
                            </body>
                          </html>
                        `)
                      }}
                      className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>WiFi Speed</label>
            <select
              name="wifi"
              value={formData.wifi}
              onChange={handleChange}
              className={`${inputClass} w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition`}
            >
              <option value="slow">🐢 Slow - Basic browsing</option>
              <option value="medium">👍 Medium - Good for work</option>
              <option value="fast">⚡ Fast - Video calls ready</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="outlets"
                checked={formData.outlets}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className={labelClass}>🔌 Power Outlets</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="coffee_available"
                checked={formData.coffee_available}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className={labelClass}>☕ Coffee Available</span>
            </label>
          </div>

          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Quietness Level (1-5)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quietness: level }))}
                  className={`flex-1 py-2 rounded-lg transition ${formData.quietness === level 
                    ? 'bg-purple-600 text-white' 
                    : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
              <span>🔊 Noisy</span>
              <span>💬 Chatty</span>
              <span>📝 Focused</span>
              <span>🤫 Quiet</span>
              <span>🔇 Library</span>
            </div>
          </div>

          <div className="mb-4">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Price Range</label>
            <select
              name="price_range"
              value={formData.price_range}
              onChange={handleChange}
              className={`${inputClass} w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition`}
            >
              <option value="$">$ - Budget (under $10)</option>
              <option value="$$">$$ - Moderate ($10-20)</option>
              <option value="$$$">$$$ - Premium ($20+)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className={`${labelClass} block text-sm font-medium mb-2`}>Opening Hours</label>
            <input
              type="text"
              name="opening_hours"
              value={formData.opening_hours}
              onChange={handleChange}
              className={`${inputClass} w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition`}
              placeholder="e.g., Mon-Fri: 8am-8pm, Sat-Sun: 9am-6pm"
            />
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploadProgress > 0 ? `Uploading ${uploadProgress}%...` : 'Submitting...'}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Submit Place
              </>
            )}
          </button>

          {/* Info Note */}
          <p className="text-xs text-center text-gray-500 mt-4">
            {images.length > 0 || videos.length > 0 
              ? `📁 ${images.length} photo(s), ${videos.length} video(s) ready to upload`
              : '📸 Add photos and videos to help others discover this place'}
          </p>
        </form>
      </div>
    </div>
  )
}

export default Contributor