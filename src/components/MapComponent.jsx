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

const MapComponent = ({ places, onPlaceClick }) => {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current).setView([40.7128, -74.0060], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '? OpenStreetMap contributors',
    }).addTo(map)
    
    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Add markers when places change
  useEffect(() => {
    if (!mapRef.current || !places || places.length === 0) return

    // Clear existing markers
    if (mapRef.current._markers) {
      mapRef.current._markers.forEach(marker => marker.remove())
    }
    mapRef.current._markers = []

    // Add markers for each place
    places.forEach((place, idx) => {
      const lat = place.latitude || 40.7128 + (Math.random() - 0.5) * 0.08
      const lng = place.longitude || -74.0060 + (Math.random() - 0.5) * 0.08
      
      const popupHtml = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">${place.name}</h3>
          <p style="color: #666; font-size: 12px; margin-bottom: 5px;">${place.address}</p>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            ${place.hasWifi ? '<span>?? WiFi</span>' : ''}
            ${place.hasPowerOutlets ? '<span>? Power</span>' : ''}
            ${place.hasCoffee ? '<span>? Coffee</span>' : ''}
          </div>
          <button onclick="window.selectPlace(${place.id})" style="background: #7c3aed; color: white; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer;">
            View Details
          </button>
        </div>
      `
      
      const marker = L.marker([lat, lng]).bindPopup(popupHtml)
      marker.addTo(mapRef.current)
      mapRef.current._markers.push(marker)
    })

    // Fit bounds to show all markers
    if (mapRef.current._markers.length > 0) {
      const bounds = L.latLngBounds(mapRef.current._markers.map(m => m.getLatLng()))
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }

    window.selectPlace = (id) => {
      const place = places.find(p => p.id === id)
      if (place && onPlaceClick) onPlaceClick(place)
    }

    return () => {
      delete window.selectPlace
    }
  }, [places, onPlaceClick])

  return <div ref={mapContainerRef} style={{ height: '500px', width: '100%', borderRadius: '12px' }} />
}

export default MapComponent
