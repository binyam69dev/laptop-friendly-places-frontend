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
      console.log('Login API response:', data)
      
      if (data.accessToken || data.token) {
        const token = data.accessToken || data.token
        const userData = data.user
        
        console.log('User data from API:', userData)
        console.log('User role:', userData?.role)
        
        const storage = rememberMe ? localStorage : sessionStorage
        storage.setItem('token', token)
        storage.setItem('user', JSON.stringify(userData))
        
        // Also store in localStorage for persistence
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        set({ 
          user: userData, 
          token: token, 
          isAuthenticated: true, 
          isLoading: false 
        })
        
        return { success: true, user: userData }
      }
      throw new Error(data.error || 'Login failed')
    } catch (error) {
      console.error('Login error:', error)
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
      if (data.accessToken || data.token) {
        const token = data.accessToken || data.token
        const userData = data.user
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        set({ 
          user: userData, 
          token: token, 
          isAuthenticated: true, 
          isLoading: false 
        })
        return { success: true, user: userData }
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Update failed')
      }
      
      const updatedUser = await response.json()
      localStorage.setItem('user', JSON.stringify(updatedUser))
      sessionStorage.setItem('user', JSON.stringify(updatedUser))
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
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
    
    console.log('checkAuth - token exists:', !!token)
    console.log('checkAuth - userStr exists:', !!userStr)
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        console.log('checkAuth - parsed user:', user)
        console.log('checkAuth - user role:', user?.role)
        
        if (user && user.email) {
          set({ user: user, token: token, isAuthenticated: true })
          return true
        }
      } catch (e) {
        console.error('Failed to parse user:', e)
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
      }
    }
    set({ isAuthenticated: false, user: null, token: null })
    return false
  },

  isAdmin: () => {
    const { user } = get()
    const isUserAdmin = user?.role === 'ADMIN' || user?.role === 'admin'
    console.log('isAdmin() - user role:', user?.role, 'result:', isUserAdmin)
    return isUserAdmin
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
