import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, MapPin, Wifi, Zap, Coffee, Heart, Loader2, Grid, Map } from 'lucide-react'
import MapComponent from '../components/MapComponent'
import { fetchPlaces } from '../services/api'
import useAuthStore from '../store/useAuthStore'
import usePlaceStore from '../store/usePlaceStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Home = () => {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const { isAuthenticated } = useAuthStore()
  const { addFavorite, removeFavorite, isFavorite, fetchFavorites } = usePlaceStore()
  const { isDarkMode } = useDarkMode()

  useEffect(() => {
    loadPlaces()
    if (isAuthenticated) {
      fetchFavorites()
    }
  }, [isAuthenticated])

  const loadPlaces = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/places`)
      const data = await response.json()
      setPlaces(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch places:', error)
      toast.error('Failed to load places')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/places?search=${search}`)
      const data = await response.json()
      setPlaces(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async (e, placeId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to save favorites')
      return
    }
    const isFav = isFavorite(placeId)
    if (isFav) {
      await removeFavorite(placeId)
      toast.success('Removed from favorites')
    } else {
      await addFavorite(placeId)
      toast.success('Added to favorites')
    }
  }

  const handlePlaceClick = (place) => {
    window.location.href = `/place/${place.id}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Find Your Workspace
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Discover laptop-friendly places with fast WiFi and power outlets
          </p>
        </div>
        
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, address, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              viewMode === 'grid' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                : `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
            }`}
          >
            <Grid className="w-4 h-4" /> Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              viewMode === 'map' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                : `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
            }`}
          >
            <Map className="w-4 h-4" /> Map View
          </button>
        </div>

        {viewMode === 'grid' && (
          places.length === 0 ? (
            <div className="text-center py-12">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No places found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => {
                const isFav = isFavorite(place.id)
                return (
                  <Link 
                    key={place.id} 
                    to={`/place/${place.id}`}
                    className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={place.images?.[0] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop'}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => handleFavorite(e, place.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition"
                      >
                        <Heart className={isFav ? "w-4 h-4 fill-red-500 text-red-500" : "w-4 h-4 text-gray-600 dark:text-gray-400"} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold text-lg mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{place.address}, {place.city}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {place.hasWifi && <Wifi className="w-4 h-4 text-blue-500" />}
                          {place.hasPowerOutlets && <Zap className="w-4 h-4 text-yellow-500" />}
                          {place.hasCoffee && <Coffee className="w-4 h-4 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {place.averageRating?.toFixed(1) || 'New'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        )}

        {viewMode === 'map' && (
          <div className="rounded-xl overflow-hidden shadow-lg">
            <MapComponent places={places} onPlaceClick={handlePlaceClick} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
