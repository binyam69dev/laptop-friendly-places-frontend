import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Default center (San Francisco)
const DEFAULT_CENTER = [37.7749, -122.4194]

const MapComponent = ({ places, onPlaceClick, center, zoom }) => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const markersRef = useRef({})

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const mapCenter = center || DEFAULT_CENTER
    const mapZoom = zoom || 12

    const map = L.map(mapContainerRef.current).setView(mapCenter, mapZoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)
    
    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center, zoom])

  // Update markers when places change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove()
    })
    markersRef.current = {}

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
          
          // Create custom marker with popup
          const marker = L.marker(position)
            .bindPopup(
              <div style="min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 8px;"></h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 8px;"></p>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  
                  
                </div>
                <button 
                  onclick="window.dispatchEvent(new CustomEvent('placeClick', { detail: { placeId:  } }))"
                  style="margin-top: 8px; width: 100%; padding: 6px; background: linear-gradient(135deg, #9333ea, #db2777); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;"
                >
                  View Details
                </button>
              </div>
            )
            .addTo(mapRef.current)
          
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
      if (hasValidCoordinates && places.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      } else if (hasValidCoordinates && places.length === 1) {
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
  }, [places, onPlaceClick])

  // Listen for custom place click events from popup buttons
  useEffect(() => {
    const handlePlaceClick = (event) => {
      if (onPlaceClick && event.detail?.placeId) {
        const place = places?.find(p => p.id === event.detail.placeId)
        if (place) {
          onPlaceClick(place)
        }
      }
    }
    
    window.addEventListener('placeClick', handlePlaceClick)
    return () => window.removeEventListener('placeClick', handlePlaceClick)
  }, [places, onPlaceClick])

  // Handle map center changes from props
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, zoom || 12)
    }
  }, [center, zoom])

  if (!places || places.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No locations to display on map</p>
      </div>
    )
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
      style={{ height: '100%', minHeight: '400px' }}
    />
  )
}

export default MapComponent
