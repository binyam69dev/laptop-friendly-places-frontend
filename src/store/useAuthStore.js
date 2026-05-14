import { create } from 'zustand'
import { login as apiLogin, register as apiRegister } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password, rememberMe = false) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }
    
    set({ isLoading: true })
    try {
      const data = await apiLogin(email, password)
      if (data.accessToken) {
        const storage = rememberMe ? localStorage : sessionStorage
        storage.setItem('token', data.accessToken)
        storage.setItem('user', JSON.stringify(data.user))
        
        // Also store in localStorage for persistence across tabs if rememberMe
        if (rememberMe) {
          localStorage.setItem('token', data.accessToken)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        
        set({ 
          user: data.user, 
          token: data.accessToken, 
          isAuthenticated: true, 
          isLoading: false 
        })
        return { success: true, user: data.user }
      }
      throw new Error(data.error || 'Login failed')
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },

  register: async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required' }
    }
    
    set({ isLoading: true })
    try {
      const data = await apiRegister(name, email, password)
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        set({ 
          user: data.user, 
          token: data.accessToken, 
          isAuthenticated: true, 
          isLoading: false 
        })
        return { success: true, user: data.user }
      }
      throw new Error(data.error || 'Registration failed')
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true })
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Update failed')
      
      const updatedUser = await response.json()
      localStorage.setItem('user', JSON.stringify(updatedUser))
      set({ user: updatedUser, isLoading: false })
      return { success: true, user: updatedUser }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        if (parsedUser && parsedUser.email) {
          set({ user: parsedUser, token, isAuthenticated: true })
          return true
        }
      } catch (e) {
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
      }
    }
    set({ isAuthenticated: false, user: null, token: null })
    return false
  },

  isAdmin: () => {
    const { user } = get()
    return user?.role === 'ADMIN' || user?.role === 'admin'
  },

  isAuthenticatedUser: () => {
    const { isAuthenticated } = get()
    return isAuthenticated
  },

  getUserRole: () => {
    const { user } = get()
    return user?.role || 'USER'
  }
}))

export default useAuthStore