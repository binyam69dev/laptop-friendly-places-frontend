import { useNavigate } from 'react-router-dom'
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

const Landing = () => {
  const navigate = useNavigate()
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('landing-map').setView([40.7128, -74.0060], 13)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)
      
      // Add sample markers around the map
      const locations = [
        { lat: 40.7128, lng: -74.0060, name: 'Starbucks Reserve' },
        { lat: 40.7580, lng: -73.9855, name: 'Times Square Hub' },
        { lat: 40.7489, lng: -73.9680, name: 'Empire Workspace' },
        { lat: 40.7648, lng: -73.9808, name: 'Central Perk Cafe' },
        { lat: 40.7050, lng: -74.0130, name: 'Financial District Space' },
      ]
      
      locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng])
          .bindPopup(`
            <div style="padding: 8px;">
              <strong>${loc.name}</strong><br/>
              <span style="font-size: 12px;">Laptop-friendly workspace</span>
              <div style="margin-top: 5px;">
                <span style="background: #7c3aed; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">WiFi</span>
                <span style="background: #eab308; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 4px;">Power</span>
              </div>
            </div>
          `)
          .addTo(map)
        
        // Open first marker popup
        if (loc.name === 'Starbucks Reserve') {
          marker.openPopup()
        }
      })
      
      mapRef.current = map
    }
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Full Screen Map Background */}
      <div id="landing-map" className="absolute inset-0 z-0" style={{ height: '100%', width: '100%' }} />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      
      {/* Floating Glass Card */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Map Icon Logo */}
          <div className="mb-8 animate-bounce">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              <span className="text-6xl relative z-10">???</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
            Laptop-Friendly Places
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 animate-fade-in-up">
            Discover the perfect workspace with verified WiFi, power outlets, and a comfortable atmosphere
          </p>
          
          {/* Features Row */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up animation-delay-200">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-xl">??</span>
              <span className="text-white">Verified WiFi</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-xl">?</span>
              <span className="text-white">Power Outlets</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-xl">?</span>
              <span className="text-white">Great Coffee</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-12 mb-12 animate-fade-in-up animation-delay-400">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-gray-300">Verified Places</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-300">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-300">Happy Users</div>
            </div>
          </div>
          
          {/* Get Started Button */}
          <button
            onClick={() => navigate('/home')}
            className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-600"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <span className="text-xl group-hover:translate-x-1 transition-transform">?</span>
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
      
      {/* Bottom Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
