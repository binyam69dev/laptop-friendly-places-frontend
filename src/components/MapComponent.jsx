import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createRoot } from 'react-dom/client'

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Default center (San Francisco)
const DEFAULT_CENTER = [37.7749, -122.4194]

// Custom marker colors for different place types
const getMarkerColor = (category) => {
  const colors = {
    cafe: '#8B5CF6', // Purple
    restaurant: '#EC4899', // Pink
    library: '#3B82F6', // Blue
    park: '#10B981', // Green
    'coworking': '#F59E0B', // Amber
    default: '#6B7280' // Gray
  }
  return colors[category?.toLowerCase()] || colors.default
}

// Create custom marker icon
const createCustomIcon = (color, isSelected = false) => {
  const size = isSelected ? 35 : 30
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
      <path fill="${color}" stroke="white" stroke-width="2" 
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `
  
  return L.divIcon({
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size/2],
    className: 'custom-marker'
  })
}

// Popup component for React rendering
const PopupContent = ({ place, onViewDetails }) => {
  const getRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      )
    }
    return stars
  }

  const getWifiIcon = () => {
    const wifi = place.wifi_speed || place.wifi
    if (wifi === 'fast') return '⚡'
    if (wifi === 'medium') return '👍'
    return '🐢'
  }

  return (
    <div className="min-w-[260px] max-w-[300px]">
      {/* Place Image */}
      {place.images && place.images[0] && (
        <div className="mb-3 rounded-lg overflow-hidden h-32">
          <img 
            src={place.images[0]} 
            alt={place.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Place Name */}
      <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-base">
        {place.name}
      </h3>
      
      {/* Rating */}
      {place.rating && (
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-sm">
            {getRatingStars(place.rating)}
          </div>
          <span className="text-xs text-gray-500">
            ({place.review_count || 0})
          </span>
        </div>
      )}
      
      {/* Amenities */}
      <div className="flex flex-wrap gap-1 mb-2">
        {place.wifi && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
            <span>{getWifiIcon()}</span> WiFi
          </span>
        )}
        {place.outlets && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
            🔌 Outlets
          </span>
        )}
        {place.coffee_available && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
            ☕ Coffee
          </span>
        )}
      </div>
      
      {/* Price Range */}
      {place.price_range && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {place.price_range === '$' && '💰 Budget'}
          {place.price_range === '$$' && '💰💰 Moderate'}
          {place.price_range === '$$$' && '💰💰💰 Premium'}
        </p>
      )}
      
      {/* Address */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
        📍 {place.city || place.address}
      </p>
      
      {/* View Details Button */}
      <button
        onClick={() => onViewDetails(place.id)}
        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition transform hover:scale-[1.02]"
      >
        View Details →
      </button>
    </div>
  )
}

const MapComponent = ({ 
  places, 
  onPlaceClick, 
  center, 
  zoom, 
  selectedPlaceId,
  onMapMove,
  showClusters = false,
  height = '100%',
  minHeight = '400px'
}) => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const markersRef = useRef({})
  const popupRefsRef = useRef({})
  const [isMapReady, setIsMapReady] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const mapCenter = (center && center.length === 2) ? center : DEFAULT_CENTER
    const mapZoom = zoom || 12

    const map = L.map(mapContainerRef.current).setView(mapCenter, mapZoom)
    
    // Add tile layer with better styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 3
    }).addTo(map)
    
    // Add scale control
    L.control.scale({ metric: true, imperial: true }).addTo(map)
    
    mapRef.current = map
    setIsMapReady(true)

    // Handle map move events
    if (onMapMove) {
      map.on('moveend', () => {
        const center = map.getCenter()
        const zoom = map.getZoom()
        onMapMove({ center: [center.lat, center.lng], zoom })
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      setIsMapReady(false)
    }
  }, [])

  // Handle map center changes from props
  useEffect(() => {
    if (mapRef.current && center && center.length === 2 && isMapReady) {
      mapRef.current.setView(center, zoom || mapRef.current.getZoom())
    }
  }, [center, zoom, isMapReady])

  // Update markers when places change
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      if (marker) {
        // Clean up popup content
        if (popupRefsRef.current[marker._leaflet_id]) {
          popupRefsRef.current[marker._leaflet_id] = null
        }
        marker.remove()
      }
    })
    markersRef.current = {}
    popupRefsRef.current = {}

    // Add markers for each place
    if (places && places.length > 0) {
      const bounds = L.latLngBounds()
      let hasValidCoordinates = false

      places.forEach((place) => {
        // Check if place has valid coordinates
        const lat = place.latitude || place.lat
        const lng = place.longitude || place.lng
        
        if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          hasValidCoordinates = true
          const position = [lat, lng]
          const isSelected = selectedPlaceId === place.id
          
          // Create custom marker with color based on category
          const markerColor = getMarkerColor(place.category)
          const customIcon = createCustomIcon(markerColor, isSelected)
          
          const marker = L.marker(position, { icon: customIcon }).addTo(mapRef.current)
          
          // Create popup content with React component
          const popupContent = document.createElement('div')
          const root = createRoot(popupContent)
          
          root.render(
            <PopupContent 
              place={place} 
              onViewDetails={(placeId) => {
                if (onPlaceClick) {
                  const clickedPlace = places.find(p => p.id === placeId)
                  onPlaceClick(clickedPlace)
                }
                marker.closePopup()
              }} 
            />
          )
          
          marker.bindPopup(popupContent, {
            maxWidth: 320,
            minWidth: 260,
            className: 'custom-popup'
          })
          
          marker.on('click', () => {
            if (onPlaceClick) {
              onPlaceClick(place)
            }
          })
          
          markersRef.current[place.id] = marker
          bounds.extend(position)
        }
      })

      // Fit bounds to show all markers if we have valid coordinates
      if (hasValidCoordinates && places.length > 1 && !center) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      } else if (hasValidCoordinates && places.length === 1 && !center) {
        const firstValidPlace = places.find(p => {
          const lat = p.latitude || p.lat
          const lng = p.longitude || p.lng
          return lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
        })
        if (firstValidPlace) {
          const lat = firstValidPlace.latitude || firstValidPlace.lat
          const lng = firstValidPlace.longitude || firstValidPlace.lng
          mapRef.current.setView([lat, lng], 14)
        }
      }
    }
  }, [places, onPlaceClick, selectedPlaceId, isMapReady])

  // Update marker style when selected place changes
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return
    
    // Update marker icons for selected/unselected places
    Object.entries(markersRef.current).forEach(([placeId, marker]) => {
      const place = places?.find(p => p.id === parseInt(placeId))
      if (place) {
        const isSelected = selectedPlaceId === parseInt(placeId)
        const lat = place.latitude || place.lat
        const lng = place.longitude || place.lng
        if (lat && lng) {
          const markerColor = getMarkerColor(place.category)
          const newIcon = createCustomIcon(markerColor, isSelected)
          marker.setIcon(newIcon)
        }
      }
    })
    
    // Center map on selected place
    if (selectedPlaceId) {
      const selectedPlace = places?.find(p => p.id === selectedPlaceId)
      if (selectedPlace) {
        const lat = selectedPlace.latitude || selectedPlace.lat
        const lng = selectedPlace.longitude || selectedPlace.lng
        if (lat && lng) {
          mapRef.current.setView([lat, lng], 15)
          // Open popup for selected place
          const marker = markersRef.current[selectedPlaceId]
          if (marker) {
            marker.openPopup()
          }
        }
      }
    }
  }, [selectedPlaceId, places, isMapReady])

  // Add CSS styles for custom popup and markers
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 12px;
        padding: 0;
        overflow: hidden;
        background: ${document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'};
        color: ${document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'};
      }
      .custom-popup .leaflet-popup-tip {
        background: ${document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'};
      }
      .custom-marker {
        background: transparent;
        border: none;
      }
      .custom-marker svg {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        transition: transform 0.2s ease;
      }
      .custom-marker:hover svg {
        transform: scale(1.1);
      }
      .leaflet-control-attribution {
        font-size: 9px;
        opacity: 0.7;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Handle responsive height
  const containerStyle = {
    width: '100%',
    height: height,
    minHeight: minHeight,
    position: 'relative',
    borderRadius: '0.5rem',
    overflow: 'hidden'
  }

  if (!places || places.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg" style={containerStyle}>
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-500 dark:text-gray-400">No locations to display on map</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Add places with valid coordinates to see them here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapContainerRef} 
      style={containerStyle}
      className="leaflet-container"
    />
  )
}

export default MapComponent