import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Star, Trash2, Loader2 } from 'lucide-react'
import usePlaceStore from '../store/usePlaceStore'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Favorites = () => {
  const { favorites, fetchFavorites, removeFavorite } = usePlaceStore()
  const { isAuthenticated } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadFavorites = async () => {
    setLoading(true)
    await fetchFavorites()
    setLoading(false)
  }

  const handleRemove = async (placeId, placeName) => {
    const success = await removeFavorite(placeId)
    if (success) {
      toast.success(`Removed ${placeName} from favorites`)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sign in to see favorites</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Save your favorite places and access them anywhere</p>
          <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-md transition">Sign In</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-96 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className={`min-h-screen py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No favorites yet</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Start exploring and save places you love</p>
          <Link to="/home" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-md transition">Explore Places</Link>
        </div>
      </div>
    )
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${textClass}`}>Your Favorites</h1>
          <p className={subTextClass}>{favorites.length} saved {favorites.length === 1 ? 'place' : 'places'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((place) => (
            <div key={place.id} className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${cardClass}`}>
              <Link to={`/place/${place.id}`}>
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={place.images?.[0] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop'}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-lg mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition ${textClass}`}>
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className={`text-sm truncate ${subTextClass}`}>{place.address}, {place.city}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className={`text-sm font-semibold ${textClass}`}>{place.averageRating?.toFixed(1) || 'New'}</span>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleRemove(place.id, place.name)}
                  className="w-full py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Favorites
