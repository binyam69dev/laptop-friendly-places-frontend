import { create } from 'zustand'
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from '../services/api'

const usePlaceStore = create((set, get) => ({
  favorites: [],

  fetchFavorites: async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const data = await getFavorites(token)
      set({ favorites: Array.isArray(data) ? data : [] })
      console.log('Favorites loaded:', Array.isArray(data) ? data.length : 0)
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      set({ favorites: [] })
    }
  },

  addFavorite: async (placeId) => {
    const token = localStorage.getItem('token')
    if (!token) return false
    try {
      await apiAddFavorite(placeId, token)
      await get().fetchFavorites() // Refresh favorites after adding
      return true
    } catch (error) {
      console.error('Failed to add favorite:', error)
      return false
    }
  },

  removeFavorite: async (placeId) => {
    const token = localStorage.getItem('token')
    if (!token) return false
    try {
      await apiRemoveFavorite(placeId, token)
      await get().fetchFavorites() // Refresh favorites after removing
      return true
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      return false
    }
  },

  isFavorite: (placeId) => {
    const favorites = get().favorites
    return favorites.some(f => f.id === placeId)
  }
}))

export default usePlaceStore
