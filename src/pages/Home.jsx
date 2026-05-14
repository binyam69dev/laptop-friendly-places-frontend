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
      const data = await fetchPlaces()
      setPlaces(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch places:', error)
      toast.error('Failed to load places')
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadPlaces()
      return
    }
    setLoading(true)
    try {
      const data = await fetchPlaces()
      const filtered = data.filter(place => 
        place.name?.toLowerCase().includes(search.toLowerCase()) ||
        place.city?.toLowerCase().includes(search.toLowerCase()) ||
        place.address?.toLowerCase().includes(search.toLowerCase())
      )
      setPlaces(filtered)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (placeId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites')
      return
    }
    if (isFavorite(placeId)) {
      await removeFavorite(placeId)
      toast.success('Removed from favorites')
    } else {
      await addFavorite(placeId)
      toast.success('Added to favorites')
    }
  }

  const getWifiIcon = (speed) => {
    if (speed === 'fast') return <Wifi className="w-3 h-3 text-green-500" />
    if (speed === 'medium') return <Wifi className="w-3 h-3 text-yellow-500" />
    return <Wifi className="w-3 h-3 text-red-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'

  return (
    <div className={`${bgClass} min-h-screen`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`${textClass} text-3xl font-bold`}>
              Laptop-Friendly Places
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Find the perfect spot to work remotely
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition ${viewMode === 'map' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, city, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`${inputClass} w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none transition`}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Search
          </button>
        </div>

        {/* Content */}
        {places.length === 0 ? (
          <div className="text-center py-12">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              No places found. Try a different search.
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-96 rounded-xl overflow-hidden">
            <MapComponent places={places} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div
                key={place.id}
                className={`${cardClass} rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.02] hover:shadow-xl`}
              >
                <Link to={`/place/${place.id}`}>
                  <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 relative">
                    {place.image ? (
                      <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Coffee className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleFavoriteToggle(place.id)
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite(place.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                      />
                    </button>
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/place/${place.id}`}>
                    <h3 className={`${textClass} font-bold text-lg mb-2`}>
                      {place.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{place.city || place.address?.split(',')[0] || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {place.wifi && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        {getWifiIcon(place.wifi_speed)} {place.wifi_speed || place.wifi}
                      </span>
                    )}
                    {place.outlets && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                        <Zap className="w-3 h-3" /> Outlets
                      </span>
                    )}
                    {place.quietness && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                        <Star className="w-3 h-3" /> Quiet {place.quietness}/5
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {place.rating || 4.5}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({place.review_count || 0} reviews)
                      </span>
                    </div>
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

export default Home