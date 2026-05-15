import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wifi, Zap, Coffee, Star, MapPin, Clock, Heart, User, Calendar, Loader2, Send, Video, Image as ImageIcon, Play, X, Award } from 'lucide-react'
import { fetchPlaceById } from '../services/api'
import useAuthStore from '../store/useAuthStore'
import usePlaceStore from '../store/usePlaceStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const PlaceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { addFavorite, removeFavorite, isFavorite } = usePlaceStore()
  const { isDarkMode } = useDarkMode()
  const [place, setPlace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [allMedia, setAllMedia] = useState([])

  useEffect(() => {
    fetchPlace()
    fetchReviews()
  }, [id])

  // Combine all media for gallery view
  useEffect(() => {
    if (place) {
      const media = []
      if (place.images && place.images.length) {
        place.images.forEach(img => media.push({ type: 'image', url: img }))
      }
      if (place.videos && place.videos.length) {
        place.videos.forEach(vid => media.push({ type: 'video', url: vid }))
      }
      setAllMedia(media)
    }
  }, [place])

  const fetchPlace = async () => {
    setLoading(true)
    try {
      const data = await fetchPlaceById(id)
      setPlace(data)
      setFavorited(isFavorite(parseInt(id)))
    } catch (error) {
      console.error('Failed to fetch place:', error)
      toast.error('Failed to load place details')
      navigate('/home')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/place/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await response.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setReviews([])
    }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites')
      navigate('/login')
      return
    }
    
    if (favorited) {
      const success = await removeFavorite(parseInt(id))
      if (success) {
        setFavorited(false)
        toast.success('Removed from favorites')
      }
    } else {
      const success = await addFavorite(parseInt(id))
      if (success) {
        setFavorited(true)
        toast.success('Added to favorites')
      }
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to leave a review')
      navigate('/login')
      return
    }
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!comment.trim()) {
      toast.error('Please write a review')
      return
    }
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          placeId: parseInt(id),
          rating,
          comment
        })
      })
      
      if (!response.ok) throw new Error('Failed to submit review')
      
      toast.success('Review submitted!')
      setRating(0)
      setComment('')
      fetchReviews()
      fetchPlace()
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openMediaViewer = (index) => {
    setCurrentMediaIndex(index)
    setSelectedMedia(allMedia[index].url)
    setMediaType(allMedia[index].type)
  }

  const nextMedia = () => {
    const nextIndex = (currentMediaIndex + 1) % allMedia.length
    setCurrentMediaIndex(nextIndex)
    setSelectedMedia(allMedia[nextIndex].url)
    setMediaType(allMedia[nextIndex].type)
  }

  const previousMedia = () => {
    const prevIndex = (currentMediaIndex - 1 + allMedia.length) % allMedia.length
    setCurrentMediaIndex(prevIndex)
    setSelectedMedia(allMedia[prevIndex].url)
    setMediaType(allMedia[prevIndex].type)
  }

  const getWifiIcon = () => {
    const speed = place?.wifi_speed || place?.wifi
    if (speed === 'fast') return <Wifi className="w-5 h-5 text-green-500" />
    if (speed === 'medium') return <Wifi className="w-5 h-5 text-yellow-500" />
    return <Wifi className="w-5 h-5 text-red-500" />
  }

  const getPriceRangeDisplay = (priceRange) => {
    if (!priceRange) return null
    const ranges = {
      '$': '💰 Budget (Under $10)',
      '$$': '💰💰 Moderate ($10-20)',
      '$$$': '💰💰💰 Premium ($20+)'
    }
    return ranges[priceRange] || priceRange
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!place) return null

  return (
    <div className={`${bgClass} min-h-screen`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${textClass}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Place Header */}
        <div className={`${cardClass} rounded-2xl shadow-lg overflow-hidden mb-8`}>
          {/* Hero Image Section */}
          <div className="relative">
            {place.images && place.images.length > 0 ? (
              <>
                <div className="h-64 md:h-96 bg-gradient-to-r from-purple-600 to-pink-600 relative">
                  <img 
                    src={place.images[0]} 
                    alt={place.name} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Media Gallery Indicator */}
                  {(place.images.length > 1 || (place.videos && place.videos.length > 0)) && (
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>{place.images.length} photos</span>
                      {place.videos && place.videos.length > 0 && (
                        <>
                          <Video className="w-4 h-4 ml-2" />
                          <span>{place.videos.length} videos</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* View All Media Button */}
                  {allMedia.length > 0 && (
                    <button
                      onClick={() => openMediaViewer(0)}
                      className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-black/80 transition"
                    >
                      <Play className="w-4 h-4" />
                      View All Media
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="h-64 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center relative">
                <Coffee className="w-20 h-20 text-white opacity-50" />
              </div>
            )}
            
            <button
              onClick={handleFavorite}
              className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md hover:scale-110 transition"
            >
              <Heart
                className={`w-6 h-6 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
              />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h1 className={`${textClass} text-3xl font-bold`}>
                {place.name}
              </h1>
              {/* Price Range Badge */}
              {place.price_range && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  {getPriceRangeDisplay(place.price_range)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{place.address}, {place.city}</span>
            </div>

            {/* Contributor Info */}
            {place.submittedBy && (
              <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700 dark:text-purple-300">
                  Contributed by: {place.submittedBy}
                </span>
                {place.status === 'pending' && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                    Pending Approval
                  </span>
                )}
              </div>
            )}

            {/* Amenities */}
            <div className="flex flex-wrap gap-3 mb-6">
              {place.wifi && (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  {getWifiIcon()} {place.wifi_speed || place.wifi} WiFi
                </span>
              )}
              {place.outlets && (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <Zap className="w-4 h-4" /> Power Outlets
                </span>
              )}
              {place.coffee_available && (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  <Coffee className="w-4 h-4" /> Coffee Available
                </span>
              )}
              {place.quietness && (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  <Star className="w-4 h-4" /> Quiet Level: {place.quietness}/5
                </span>
              )}
            </div>

            {place.description && (
              <div className="mb-6">
                <h2 className={`${textClass} font-semibold mb-2`}>
                  About
                </h2>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {place.description}
                </p>
              </div>
            )}

            {place.opening_hours && (
              <div>
                <h2 className={`${textClass} font-semibold mb-2`}>
                  <Clock className="inline w-4 h-4 mr-2" />
                  Opening Hours
                </h2>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {place.opening_hours}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Media Gallery Section (if more than 1 media) */}
        {allMedia.length > 1 && (
          <div className={`${cardClass} rounded-2xl shadow-lg p-6 mb-8`}>
            <h2 className={`${textClass} text-xl font-bold mb-4 flex items-center gap-2`}>
              <ImageIcon className="w-5 h-5" />
              Media Gallery
            </h2>
            
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allMedia.slice(0, 6).map((media, idx) => (
                <div
                  key={idx}
                  onClick={() => openMediaViewer(idx)}
                  className="relative cursor-pointer rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video group hover:opacity-90 transition"
                >
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt={`Media ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video 
                        src={media.url} 
                        className="w-full h-full object-cover"
                        poster={place.images?.[0]}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </>
                  )}
                  
                  {/* Media Type Badge */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded text-xs">
                    {media.type === 'image' ? '📷' : '🎥'}
                  </div>
                </div>
              ))}
              
              {allMedia.length > 6 && (
                <div className="relative cursor-pointer rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 aspect-video flex items-center justify-center group">
                  <span className="text-white text-2xl font-bold">+{allMedia.length - 6}</span>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button 
                      onClick={() => openMediaViewer(0)}
                      className="text-white text-sm"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
          <h2 className={`${textClass} text-xl font-bold mb-4`}>
            Reviews ({reviews.length})
          </h2>

          {/* Write Review Form */}
          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <h3 className={`${textClass} font-semibold mb-3`}>
                Write a Review
              </h3>
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition ${star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Tap to rate'}
                </span>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className={`${inputClass} w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none transition`}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className={`${cardClass} p-4 rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className={`${textClass} font-semibold text-sm`}>
                          {review.user_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className={`${textClass} text-sm`}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 transition"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Navigation Buttons */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); previousMedia(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              
              {/* Media Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentMediaIndex + 1} / {allMedia.length}
              </div>
            </>
          )}
          
          {mediaType === 'image' ? (
            <img 
              src={selectedMedia} 
              alt="Full size" 
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video 
              controls 
              autoPlay 
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <source src={selectedMedia} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
    </div>
  )
}

// Add ChevronLeft/Right if not imported
const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default PlaceDetails