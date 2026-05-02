import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, MapPin, Wifi, Zap, Coffee, Heart, Loader2 } from 'lucide-react'
import { fetchPlaces } from '../services/api'
import useAuthStore from '../store/useAuthStore'
import usePlaceStore from '../store/usePlaceStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Places = () => {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
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
      let data = await fetchPlaces()
      if (filter === 'wifi') data = data.filter(p => p.hasWifi)
      if (filter === 'power') data = data.filter(p => p.hasPowerOutlets)
      if (filter === 'coffee') data = data.filter(p => p.hasCoffee)
      setPlaces(data)
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
      let data = await response.json()
      if (filter === 'wifi') data = data.filter(p => p.hasWifi)
      if (filter === 'power') data = data.filter(p => p.hasPowerOutlets)
      if (filter === 'coffee') data = data.filter(p => p.hasCoffee)
      setPlaces(data)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const filterButtons = [
    { key: 'all', label: 'All', icon: null },
    { key: 'wifi', label: 'WiFi', icon: Wifi },
    { key: 'power', label: 'Power', icon: Zap },
    { key: 'coffee', label: 'Coffee', icon: Coffee },
  ]

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const inputClass = isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-2 ${textClass}`}>All Places</h1>
        <p className={`mb-6 ${subTextClass}`}>Browse all laptop-friendly workspaces</p>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, address, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${inputClass}`}
            />
          </div>
          <div className="flex gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => { setFilter(btn.key); loadPlaces(); }}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  filter === btn.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {btn.icon && <btn.icon className="w-4 h-4" />}
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Places Grid */}
        {places.length === 0 ? (
          <div className="text-center py-12">
            <p className={subTextClass}>No places found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => {
              const isFav = isFavorite(place.id)
              return (
                <Link
                  key={place.id}
                  to={`/place/${place.id}`}
                  className={`group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${cardClass}`}
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
                    {place.averageRating > 0 && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded-lg text-white text-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{place.averageRating.toFixed(1)}</span>
                      </div>
                    )}
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
                      <div className="flex gap-2">
                        {place.hasWifi && <Wifi className="w-4 h-4 text-blue-500" title="Free WiFi" />}
                        {place.hasPowerOutlets && <Zap className="w-4 h-4 text-yellow-500" title="Power Outlets" />}
                        {place.hasCoffee && <Coffee className="w-4 h-4 text-amber-500" title="Coffee Available" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className={`text-sm font-semibold ${textClass}`}>{place.averageRating?.toFixed(1) || 'New'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Places
