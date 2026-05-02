import axios from 'axios'

// Better - with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

// ==================== AUTH API ====================
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
}

// ==================== PLACES API ====================
export const placesAPI = {
  getAll: (params = {}) => api.get('/places', { params }),
  getById: (id) => api.get(`/places/${id}`),
  getNearby: (lat, lng, radius = 5000) => 
    api.get('/places/nearby', { params: { lat, lng, radius } }),
  create: (data) => api.post('/places', data),
  update: (id, data) => api.put(`/places/${id}`, data),
  delete: (id) => api.delete(`/places/${id}`),
}

// ==================== REVIEWS API ====================
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getByPlace: (placeId) => api.get(`/reviews/place/${placeId}`),
}

// ==================== FAVORITES API ====================
export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (placeId) => api.post('/favorites', { placeId }),
  remove: (placeId) => api.delete(`/favorites/${placeId}`),
  check: (placeId) => api.get(`/favorites/check/${placeId}`),
}

// Also keep your original simple exports for backward compatibility
export const fetchPlaces = async () => {
  const response = await fetch(`${API_URL}/places`)
  return response.json()
}

export const fetchPlaceById = async (id) => {
  const response = await fetch(`${API_URL}/places/${id}`)
  return response.json()
}

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  return response.json()
}

export default api
