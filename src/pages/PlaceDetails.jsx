import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wifi, Zap, Coffee, Star, MapPin, Clock, Heart, User, Calendar, Loader2, Send } from 'lucide-react'
import { fetchPlaceById } from '../services/api'
import useAuthStore from '../store/useAuthStore'
import usePlaceStore from '../store/usePlaceStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const PlaceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addFavorite, removeFavorite, isFavorite } = usePlaceStore()
  const { isDarkMode } = useDarkMode()
  const [place, setPlace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { fetchPlace(); fetchReviews() }, [id])

  const fetchPlace = async () => {
    try { const data = await fetchPlaceById(id); setPlace(data); setFavorited(isFavorite(parseInt(id))) } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const fetchReviews = async () => {
    try { const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/place/${id}`); const data = await res.json(); setReviews(data) } catch (error) { console.error(error) }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) { toast.error('Please login'); navigate('/login'); return }
    if (favorited) { await removeFavorite(parseInt(id)); setFavorited(false); toast.success('Removed from favorites') } 
    else { await addFavorite(parseInt(id)); setFavorited(true); toast.success('Added to favorites') }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please login'); navigate('/login'); return }
    if (rating === 0) { toast.error('Please select a rating'); return }
    if (!comment.trim()) { toast.error('Please write a review'); return }
    setIsSubmitting(true)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') }, body: JSON.stringify({ placeId: parseInt(id), rating, comment }) })
      toast.success('Review submitted!'); setRating(0); setComment(''); fetchReviews(); fetchPlace()
    } catch (error) { toast.error('Failed to submit review') } finally { setIsSubmitting(false) }
  }

  if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
  if (!place) return <div className="text-center py-12"><p className="text-red-600 mb-4">Place not found</p><button onClick={() => navigate('/')} className="btn-primary">Go Home</button></div>

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900"><div className="container mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6"><ArrowLeft className="w-5 h-5" /> Back</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6"><img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800" alt={place.name} className="w-full h-96 object-cover" /><button onClick={handleFavorite} className="absolute top-4 right-4 p-3 bg-white/90 rounded-full shadow-lg hover:scale-110 transition"><Heart className={`w-6 h-6 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} /></button></div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"><h1 className="text-3xl font-bold mb-2">{place.name}</h1><div className="flex items-center gap-4 mb-4"><div className="flex items-center gap-1"><Star className="w-5 h-5 fill-yellow-400 text-yellow-400" /><span className="font-semibold">{place.averageRating?.toFixed(1) || 'New'}</span></div><div className="flex items-center gap-1 text-gray-600"><MapPin className="w-4 h-4" /><span>{place.address}</span></div></div><p className="text-gray-700 dark:text-gray-300 mb-6">{place.description}</p><div className="flex gap-4 pt-4 border-t"><div className="flex items-center gap-2"><Wifi className={place.hasWifi ? 'text-green-600' : 'text-gray-400'} /><span>{place.hasWifi ? 'Free WiFi' : 'No WiFi'}</span></div><div className="flex items-center gap-2"><Zap className={place.hasPowerOutlets ? 'text-yellow-600' : 'text-gray-400'} /><span>{place.hasPowerOutlets ? 'Power Outlets' : 'No Outlets'}</span></div><div className="flex items-center gap-2"><Coffee className={place.hasCoffee ? 'text-amber-600' : 'text-gray-400'} /><span>{place.hasCoffee ? 'Coffee Available' : 'No Coffee'}</span></div></div></div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-6"><h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
            {isAuthenticated ? (<form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><h3 className="font-semibold mb-3">Write a Review</h3><div className="mb-3"><label className="block text-sm font-medium mb-2">Your Rating</label><div className="flex gap-1">{[...Array(5)].map((_, i) => (<button key={i} type="button" onClick={() => setRating(i + 1)} className="focus:outline-none"><Star className={`w-6 h-6 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} /></button>))}</div></div><div className="mb-3"><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Share your experience..." /></div><button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Review</button></form>) : (<div className="text-center p-4 bg-gray-50 rounded-xl mb-6"><p>Please <button onClick={() => navigate('/login')} className="text-purple-600 hover:underline">login</button> to leave a review</p></div>)}
            {reviews.length === 0 ? <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p> : reviews.map(review => (<div key={review.id} className="border-b last:border-0 py-4"><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><User className="w-4 h-4 text-purple-600" /></div><div><span className="font-semibold">{review.user?.name || 'Anonymous'}</span><div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}</div></div></div><span className="text-xs text-gray-400"><Calendar className="w-3 h-3 inline mr-1" />{new Date(review.createdAt).toLocaleDateString()}</span></div><p className="text-gray-700 ml-10">{review.comment}</p></div>))}</div>
        </div>
        <div className="space-y-6"><div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"><h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Opening Hours</h3><p className="text-gray-600">{place.openingHours || 'Hours not specified'}</p></div><div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"><h3 className="font-semibold mb-3">Price Range</h3><div className="text-2xl font-bold text-green-600">{place.priceLevel === 'CHEAP' ? '$' : place.priceLevel === 'MODERATE' ? '$$' : place.priceLevel === 'EXPENSIVE' ? '$$$' : '$$'}</div></div></div>
      </div>
    </div></div>
  )
}

export default PlaceDetails
