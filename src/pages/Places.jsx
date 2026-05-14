import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, MapPin, Wifi, Zap, Coffee, Heart, Loader2, X } from 'lucide-react'
import { fetchPlaces } from '../services/api'
import useAuthStore from '../store/useAuthStore'
import usePlaceStore from '../store/usePlaceStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Places = () => {
  const [places, setPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    wifi: '',
    outlets: false,
    minQuietness: 0,
    maxPrice: '$$'
  })
  const { isAuthenticated } = useAuthStore()
  const { addFavorite, removeFavorite, isFavorite, fetchFavorites } = usePlaceStore()
  const { isDarkMode } = useDarkMode()

  useEffect(() => {
    loadPlaces()
    if (isAuthenticated) {
      fetchFavorites()
    }
  }, [isAuthenticated])

  useEffect(() => {
    applyFilters()
  }, [search, filters, places])

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

  const applyFilters = () => {
    let filtered = [...places]
    
    // Search filter
    if (search) {
      filtered = filtered.filter(place =>
        place.name?.toLowerCase().includes(search.toLowerCase()) ||
        place.city?.toLowerCase().includes(search.toLowerCase()) ||
        place.address?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // WiFi filter
    if (filters.wifi) {
      filtered = filtered.filter(place => place.wifi === filters.wifi)
    }
    
    // Outlets filter
    if (filters.outlets) {
      filtered = filtered.filter(place => place.outlets === true)
    }
    
    // Quietness filter
    if (filters.minQuietness > 0) {
      filtered = filtered.filter(place => (place.quietness || 0) >= filters.minQuietness)
    }
    
    setFilteredPlaces(filtered)
  }

  const handleFavorite = async (placeId, e) => {
    e.preventDefault()
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

  const clearFilters = () => {
    setFilters({
      wifi: '',
      outlets: false,
      minQuietness: 0,
      maxPrice: '$$'
    })
    setSearch('')
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode 
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-purple-500' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-500'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className={`${bgClass} min-h-screen py-8`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`${textClass} text-3xl font-bold`}>
              All Places
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {filteredPlaces.length} places found
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.wifi || filters.outlets || filters.minQuietness > 0) && (
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, city, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none transition`}
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`${cardClass} mb-6 p-4 rounded-xl shadow-lg`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${textClass} font-semibold`}>Filters</h3>
              <button onClick={clearFilters} className="text-sm text-purple-600 hover:underline">
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.wifi}
                onChange={(e) => setFilters({ ...filters, wifi: e.target.value })}
                className={`${inputClass} px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none`}
              >
                <option value="">All WiFi</option>
                <option value="fast">Fast WiFi</option>
                <option value="medium">Medium WiFi</option>
                <option value="slow">Slow WiFi</option>
              </select>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.outlets}
                  onChange={(e) => setFilters({ ...filters, outlets: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className={textClass}>Has Power Outlets</span>
              </label>
              
              <select
                value={filters.minQuietness}
                onChange={(e) => setFilters({ ...filters, minQuietness: parseInt(e.target.value) })}
                className={`${inputClass} px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none`}
              >
                <option value="0">Any Noise Level</option>
                <option value="3">Quiet (3+ stars)</option>
                <option value="4">Very Quiet (4+ stars)</option>
                <option value="5">Library Quiet (5 stars)</option>
              </select>
            </div>
          </div>
        )}

        {/* Places Grid */}
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-12">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              No places found matching your criteria.
            </p>
            <button onClick={clearFilters} className="mt-4 text-purple-600 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className={`${cardClass} rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.02]`}
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
                      onClick={(e) => handleFavorite(place.id, e)}
                      className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md hover:scale-110 transition"
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
                        <Wifi className="w-3 h-3" />
                        {place.wifi}
                      </span>
                    )}
                    {place.outlets && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                        <Zap className="w-3 h-3" />
                        Outlets
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{place.rating || 4.5}</span>
                    <span className="text-xs text-gray-500 ml-1">({place.review_count || 0} reviews)</span>
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

export default Places