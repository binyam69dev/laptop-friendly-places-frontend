import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Wifi, Zap, Star, Trash2, Loader2 } from 'lucide-react'
import usePlaceStore from '../store/usePlaceStore'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Favorites = () => {
  const { favorites, fetchFavorites, removeFavorite, isLoading } = usePlaceStore()
  const { isAuthenticated } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites()
    }
  }, [isAuthenticated, fetchFavorites])

  const handleRemove = async (placeId) => {
    setRemovingId(placeId)
    const success = await removeFavorite(placeId)
    if (success) {
      toast.success('Removed from favorites')
    } else {
      toast.error('Failed to remove')
    }
    setRemovingId(null)
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please Login</h2>
          <p className="text-gray-500 mb-4">Login to see your favorite places</p>
          <Link to="/login" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className={`${bgClass} min-h-screen py-8`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className={`${textClass} text-3xl font-bold`}>
            My Favorite Places
          </h1>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-sm">
            {favorites.length} places
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className={`${textClass} text-lg`}>
              No favorite places yet
            </p>
            <Link to="/places" className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Browse Places
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((place) => (
              <div
                key={place.id}
                className={`${cardClass} rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.02]`}
              >
                <Link to={`/place/${place.id}`}>
                  <div className="h-40 bg-gradient-to-r from-purple-600 to-pink-600 relative">
                    {place.image ? (
                      <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-4xl">☕</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/place/${place.id}`}>
                    <h3 className={`${textClass} font-bold text-lg mb-2`}>
                      {place.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-3 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{place.city || place.address?.split(',')[0] || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {place.wifi && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-full">
                        <Wifi className="w-3 h-3" /> WiFi
                      </span>
                    )}
                    {place.outlets && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-full">
                        <Zap className="w-3 h-3" /> Outlets
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{place.rating || 4.5}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(place.id)}
                      disabled={removingId === place.id}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      {removingId === place.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites