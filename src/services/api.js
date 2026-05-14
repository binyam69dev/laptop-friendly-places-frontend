import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    throw error;
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPlaces = async () => {
  const response = await api.get('/places');
  return response.data;
};

export const fetchPlaceById = async (id) => {
  const response = await api.get(`/places/${id}`);
  return response.data;
};

export const addFavorite = async (placeId, token) => {
  const response = await api.post('/favorites', { placeId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const removeFavorite = async (placeId, token) => {
  const response = await api.delete(`/favorites/${placeId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getFavorites = async (token) => {
  const response = await api.get('/favorites', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default api;
