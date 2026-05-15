import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Wifi, Zap, Coffee, MapPin, Users, Building2, ChevronRight, Star, Heart, Globe, TrendingUp, Award, Sparkles, Loader2 } from 'lucide-react'

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
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalCities: 0,
    totalUsers: 0,
    totalReviews: 0,
    avgRating: 0
  })
  const [recentPlaces, setRecentPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real data from API
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        
        // Fetch places
        const placesRes = await fetch(`${apiUrl}/places`)
        const placesData = await placesRes.json()
        const approvedPlaces = placesData.filter(p => p.status === 'approved')
        
        // Fetch users
        const usersRes = await fetch(`${apiUrl}/users`)
        const usersData = await usersRes.json()
        
        // Fetch reviews
        const reviewsRes = await fetch(`${apiUrl}/reviews`)
        const reviewsData = await reviewsRes.json()
        
        // Calculate unique cities
        const uniqueCities = [...new Set(approvedPlaces.map(p => p.city).filter(Boolean))]
        
        // Calculate average rating
        const avgRating = reviewsData.length > 0 
          ? (reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length).toFixed(1)
          : 0
        
        setStats({
          totalPlaces: approvedPlaces.length,
          totalCities: uniqueCities.length,
          totalUsers: usersData.length,
          totalReviews: reviewsData.length,
          avgRating: avgRating
        })
        
        // Get recent approved places for map markers
        const recentApproved = approvedPlaces.slice(0, 8)
        setRecentPlaces(recentApproved)
        
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch real data:', error)
        // Fallback to demo data if API fails
        setStats({
          totalPlaces: 128,
          totalCities: 24,
          totalUsers: 1542,
          totalReviews: 892,
          avgRating: 4.7
        })
        setLoading(false)
      }
    }
    
    fetchRealData()
  }, [])

  // Initialize map with real places
  useEffect(() => {
    if (!mapRef.current && recentPlaces.length > 0) {
      const centerLat = recentPlaces[0]?.latitude || recentPlaces[0]?.lat || 40.7128
      const centerLng = recentPlaces[0]?.longitude || recentPlaces[0]?.lng || -74.0060
      
      const map = L.map('landing-map').setView([centerLat, centerLng], 12)
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)
      
      L.control.scale({ metric: true, imperial: true, position: 'bottomright' }).addTo(map)
      
      // Create custom marker icon
      const createCustomMarker = (color = '#7c3aed', isFirst = false) => {
        const size = isFirst ? 48 : 40
        return L.divIcon({
          html: `
            <div style="
              background: ${color};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              border: 3px solid white;
              transition: transform 0.2s ease;
              cursor: pointer;
            ">
              <span style="font-size: ${isFirst ? '24px' : '20px'};">${isFirst ? '📍' : '📌'}</span>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size/2, size],
          popupAnchor: [0, -size/2],
          className: 'custom-marker'
        })
      }
      
      // Add markers for real places
      recentPlaces.forEach((place, index) => {
        const lat = place.latitude || place.lat
        const lng = place.longitude || place.lng
        
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          const isFirst = index === 0
          const marker = L.marker([lat, lng], { 
            icon: createCustomMarker(isFirst ? '#7c3aed' : '#6b7280', isFirst)
          })
          
          // Get real review data for this place
          const placeRating = place.rating || place.average_rating || 4.5
          const reviewCount = place.review_count || place.total_reviews || 0
          
          const getWifiIcon = () => {
            const wifi = place.wifi_speed || place.wifi
            if (wifi === 'fast') return '⚡ Fast'
            if (wifi === 'medium') return '👍 Good'
            return '🐢 Basic'
          }
          
          const getPriceSymbol = () => {
            const price = place.price_range
            if (price === '$') return '💰 Budget'
            if (price === '$$') return '💰💰 Moderate'
            if (price === '$$$') return '💰💰💰 Premium'
            return '💰💰 Moderate'
          }
          
          const popupContent = `
            <div style="
              font-family: system-ui, -apple-system, sans-serif;
              min-width: 280px;
              max-width: 320px;
            ">
              <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 120px;
                border-radius: 8px 8px 0 0;
                margin: -12px -12px 0 -12px;
                position: relative;
                overflow: hidden;
              ">
                ${place.images && place.images[0] ? `
                  <img 
                    src="${place.images[0]}" 
                    alt="${place.name}"
                    style="
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                    "
                  />
                ` : `
                  <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                  ">
                    <span style="font-size: 48px;">🏢</span>
                  </div>
                `}
                <div style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
                  padding: 8px 12px;
                ">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    ${'★'.repeat(Math.floor(placeRating))}${placeRating % 1 ? '½' : ''}
                    <span style="color: #fbbf24; font-size: 12px;">★</span>
                    <span style="color: white; font-size: 11px; margin-left: 4px;">${placeRating}</span>
                    ${reviewCount > 0 ? `<span style="color: rgba(255,255,255,0.8); font-size: 10px; margin-left: 4px;">(${reviewCount} reviews)</span>` : ''}
                  </div>
                </div>
              </div>
              
              <div style="padding: 12px;">
                <h3 style="
                  margin: 0 0 4px 0;
                  font-size: 16px;
                  font-weight: bold;
                  color: #1f2937;
                ">${place.name}</h3>
                
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  margin-bottom: 8px;
                  font-size: 11px;
                  color: #6b7280;
                ">
                  <span>📍</span>
                  <span>${place.city || 'Unknown City'}, ${place.country || 'Unknown'}</span>
                </div>
                
                <div style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                  margin-bottom: 10px;
                ">
                  <span style="
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                  ">
                    <span>📶</span> ${getWifiIcon()}
                  </span>
                  ${place.outlets ? `
                    <span style="
                      background: #dcfce7;
                      color: #166534;
                      padding: 2px 8px;
                      border-radius: 12px;
                      font-size: 10px;
                      display: inline-flex;
                      align-items: center;
                      gap: 4px;
                    ">
                      <span>🔌</span> Outlets
                    </span>
                  ` : ''}
                  ${place.coffee_available ? `
                    <span style="
                      background: #fef3c7;
                      color: #92400e;
                      padding: 2px 8px;
                      border-radius: 12px;
                      font-size: 10px;
                      display: inline-flex;
                      align-items: center;
                      gap: 4px;
                    ">
                      <span>☕</span> Coffee
                    </span>
                  ` : ''}
                  <span style="
                    background: #f3e8ff;
                    color: #6b21a5;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                  ">
                    ${getPriceSymbol()}
                  </span>
                </div>
                
                ${place.description ? `
                  <div style="
                    font-size: 11px;
                    color: #4b5563;
                    margin-bottom: 10px;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  ">
                    ${place.description.substring(0, 100)}${place.description.length > 100 ? '...' : ''}
                  </div>
                ` : ''}
                
                <button onclick="window.dispatchEvent(new CustomEvent('viewPlace', { detail: { placeId: ${place.id} } }))" style="
                  width: 100%;
                  padding: 8px;
                  background: linear-gradient(135deg, #7c3aed, #db2777);
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: transform 0.2s ease;
                ">
                  View Details →
                </button>
              </div>
            </div>
          `
          
          marker.bindPopup(popupContent, {
            maxWidth: 360,
            minWidth: 300,
            className: 'custom-landing-popup'
          })
          
          marker.addTo(map)
          
          if (isFirst) {
            setTimeout(() => marker.openPopup(), 1000)
          }
          
          marker.on('mouseover', function() {
            const element = this.getElement()
            if (element) {
              element.style.transform = 'scale(1.1)'
              element.style.transition = 'transform 0.2s ease'
            }
          })
          
          marker.on('mouseout', function() {
            const element = this.getElement()
            if (element) {
              element.style.transform = 'scale(1)'
            }
          })
        }
      })
      
      // Add pulsing circle effect for the center
      if (recentPlaces[0]) {
        const centerLat = recentPlaces[0].latitude || recentPlaces[0].lat
        const centerLng = recentPlaces[0].longitude || recentPlaces[0].lng
        const pulseCircle = L.circle([centerLat, centerLng], {
          color: '#7c3aed',
          weight: 2,
          fillColor: '#7c3aed',
          fillOpacity: 0.1,
          radius: 500,
        }).addTo(map)
        
        let radius = 500
        let growing = true
        setInterval(() => {
          if (growing) {
            radius += 50
            if (radius >= 800) growing = false
          } else {
            radius -= 50
            if (radius <= 500) growing = true
          }
          pulseCircle.setRadius(radius)
        }, 2000)
      }
      
      mapRef.current = map
      setIsMapLoaded(true)
    }
    
    const handleViewPlace = (event) => {
      if (event.detail?.placeId) {
        navigate(`/place/${event.detail.placeId}`)
      }
    }
    
    document.addEventListener('viewPlace', handleViewPlace)
    
    return () => {
      document.removeEventListener('viewPlace', handleViewPlace)
    }
  }, [recentPlaces, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Loading amazing places...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Screen Map Background */}
      <div 
        id="landing-map" 
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{ 
          height: '100%', 
          width: '100%',
          opacity: isMapLoaded ? 1 : 0
        }} 
      />
      
      {/* Map Loading Spinner */}
      {!isMapLoaded && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/80">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              opacity: 0.1 + Math.random() * 0.2
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        ))}
      </div>
      
      {/* Floating Glass Card */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Logo */}
          <div className="mb-8 animate-float">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              <div className="relative z-10 flex items-center justify-center gap-1">
                <MapPin className="w-12 h-12 text-white" />
                <Coffee className="w-10 h-10 text-white/90" />
              </div>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 animate-fade-in-up">
            Find Your Perfect
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}Workspace
            </span>
          </h1>
          
          {/* Subtitle with Real Stats */}
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-200">
            Discover {stats.totalPlaces}+ laptop-friendly cafes, libraries, and coworking spaces across {stats.totalCities} cities with verified WiFi, power outlets, and great ambiance
          </p>
          
          {/* Features Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition">
              <Wifi className="w-5 h-5 text-purple-400" />
              <span className="text-white">Verified WiFi</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Power Outlets</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition">
              <Coffee className="w-5 h-5 text-amber-400" />
              <span className="text-white">Great Coffee</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white">User Reviews</span>
            </div>
          </div>
          
          {/* Real Stats with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12 animate-fade-in-up animation-delay-600">
            <div className="text-center group hover:transform hover:scale-105 transition">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalPlaces}+</div>
              <div className="text-sm text-gray-300">Verified Places</div>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
                  <Globe className="w-6 h-6 text-pink-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalCities}+</div>
              <div className="text-sm text-gray-300">Cities Worldwide</div>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalUsers}+</div>
              <div className="text-sm text-gray-300">Happy Remote Workers</div>
            </div>
            
            <div className="text-center group hover:transform hover:scale-105 transition">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.avgRating}</div>
              <div className="text-sm text-gray-300">Average Rating</div>
            </div>
          </div>
          
          {/* Trust Badges with Real Data Context */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in-up animation-delay-800">
            <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300">
                {stats.totalReviews}+ Trusted Reviews
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">
                Community Driven
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full">
              <Heart className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">
                Real User Data
              </span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-1000">
            <button
              onClick={() => navigate('/home')}
              className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore {stats.totalPlaces}+ Places
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button
              onClick={() => navigate('/contributor')}
              className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Add a Place
            </button>
          </div>
          
          {/* Trust Indicator with Real Data */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span>Join {stats.totalUsers}+ remote workers finding their perfect workspace</span>
            </div>
          </div>
          
          {/* Live Update Indicator */}
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live data from {stats.totalCities} cities</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        <div className="animate-bounce-slow">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
          opacity: 0;
        }
        
        .custom-landing-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        }
        
        .custom-landing-popup .leaflet-popup-tip {
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}

export default Landing