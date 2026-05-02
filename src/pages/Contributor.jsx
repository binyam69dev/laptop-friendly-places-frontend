import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, MapPin, Wifi, Zap, Coffee, DollarSign, X, Image, Video, Loader2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Contributor = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [videoPreviews, setVideoPreviews] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    description: '',
    hasWifi: true,
    hasPowerOutlets: true,
    hasCoffee: true,
    priceLevel: 'MODERATE',
    placeType: 'cafe'
  })

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = []
    const newImages = []
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Image too large: ${file.name} (Max 10MB)`)
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`Not an image: ${file.name}`)
        return
      }
      newImages.push(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result)
        if (newPreviews.length === newImages.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
          setImages([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = []
    const newVideos = []
    
    files.forEach(file => {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`Video too large: ${file.name} (Max 100MB)`)
        return
      }
      if (!file.type.startsWith('video/')) {
        toast.error(`Not a video: ${file.name}`)
        return
      }
      newVideos.push(file)
      const url = URL.createObjectURL(file)
      newPreviews.push(url)
      setVideoPreviews([...videoPreviews, ...newPreviews])
      setVideos([...videos, ...newVideos])
    })
  }

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
    setImages(images.filter((_, i) => i !== index))
  }

  const removeVideo = (index) => {
    URL.revokeObjectURL(videoPreviews[index])
    setVideoPreviews(videoPreviews.filter((_, i) => i !== index))
    setVideos(videos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Place name is required')
      return
    }
    if (!formData.address.trim()) {
      toast.error('Address is required')
      return
    }
    if (!formData.city.trim()) {
      toast.error('City is required')
      return
    }
    
    setLoading(true)
    
    try {
      // Upload images
      const uploadedImages = []
      for (const file of images) {
        const formDataImg = new FormData()
        formDataImg.append('file', file)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
          body: formDataImg
        })
        const data = await response.json()
        uploadedImages.push(data.url)
      }
      
      // Upload videos
      const uploadedVideos = []
      for (const file of videos) {
        const formDataVideo = new FormData()
        formDataVideo.append('file', file)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
          body: formDataVideo
        })
        const data = await response.json()
        uploadedVideos.push(data.url)
      }
      
      // Create place with PENDING status
      const placeData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        description: formData.description,
        hasWifi: formData.hasWifi,
        hasPowerOutlets: formData.hasPowerOutlets,
        hasCoffee: formData.hasCoffee,
        priceLevel: formData.priceLevel,
        placeType: formData.placeType,
        images: uploadedImages,
        videos: uploadedVideos,
        status: 'PENDING'
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/places`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(placeData)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Place submitted:', result)
        toast.success('Place submitted for review! Admin will review it soon.')
        navigate('/places')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit')
      }
    } catch (error) {
      console.error('Failed to submit place:', error)
      toast.error(error.message || 'Failed to submit place. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'

  return (
    <div className={`min-h-screen py-8 ${bgClass}`}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className={`rounded-2xl shadow-lg p-6 ${cardClass}`}>
          <h1 className={`text-2xl font-bold mb-2 ${textClass}`}>Add New Place</h1>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Share a great workspace spot. Your submission will be reviewed by an admin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textClass}`}>Place Name *</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${inputClass}`} 
                placeholder="e.g., Starbucks Reserve"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textClass}`}>Address *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} 
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textClass}`}>City *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})} 
                  className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} 
                  placeholder="New York"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${textClass}`}>Description</label>
              <textarea 
                rows="3" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className={`w-full px-4 py-2 border rounded-lg ${inputClass}`} 
                placeholder="Describe the atmosphere, seating, noise level, etc."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textClass}`}>Amenities</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.hasWifi} onChange={(e) => setFormData({...formData, hasWifi: e.target.checked})} className="w-4 h-4" />
                  <Wifi className="w-4 h-4 text-blue-500" /> WiFi
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.hasPowerOutlets} onChange={(e) => setFormData({...formData, hasPowerOutlets: e.target.checked})} className="w-4 h-4" />
                  <Zap className="w-4 h-4 text-yellow-500" /> Power Outlets
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.hasCoffee} onChange={(e) => setFormData({...formData, hasCoffee: e.target.checked})} className="w-4 h-4" />
                  <Coffee className="w-4 h-4 text-amber-500" /> Coffee
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textClass}`}>Price Level</label>
                <select 
                  value={formData.priceLevel} 
                  onChange={(e) => setFormData({...formData, priceLevel: e.target.value})} 
                  className={`w-full px-4 py-2 border rounded-lg ${inputClass}`}
                >
                  <option value="CHEAP">$ - Cheap</option>
                  <option value="MODERATE">$$ - Moderate</option>
                  <option value="EXPENSIVE">$$$ - Expensive</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${textClass}`}>Place Type</label>
                <select 
                  value={formData.placeType} 
                  onChange={(e) => setFormData({...formData, placeType: e.target.value})} 
                  className={`w-full px-4 py-2 border rounded-lg ${inputClass}`}
                >
                  <option value="cafe">Cafe / Coffee Shop</option>
                  <option value="library">Library</option>
                  <option value="coworking">Coworking Space</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel Lobby</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textClass}`}>Photos</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload images</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </label>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img src={preview} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">?</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textClass}`}>Videos (Optional)</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" id="video-upload" />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload videos</p>
                  <p className="text-xs text-gray-400">MP4, WebM up to 100MB</p>
                </label>
              </div>
              {videoPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {videoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <video src={preview} className="w-full h-24 object-cover rounded-lg" controls />
                      <button type="button" onClick={() => removeVideo(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">?</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contributor
