const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}`;

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

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  return response.json()
}

export const addFavorite = async (placeId, token) => {
  const response = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ placeId })
  })
  return response.json()
}

export const removeFavorite = async (placeId, token) => {
  const response = await fetch(`${API_URL}/favorites/${placeId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}

export const getFavorites = async (token) => {
  const response = await fetch(`${API_URL}/favorites`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}

export const addReview = async (placeId, rating, comment, token) => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ placeId, rating, comment })
  })
  return response.json()
}

export const getReviews = async (placeId) => {
  const response = await fetch(`${API_URL}/reviews/place/${placeId}`)
  return response.json()
}
