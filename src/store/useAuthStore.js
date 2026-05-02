import { create } from 'zustand'
import { login as apiLogin, register as apiRegister } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }
    
    set({ isLoading: true })
    try {
      const data = await apiLogin(email, password)
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        set({ 
          user: data.user, 
          token: data.accessToken, 
          isAuthenticated: true, 
          isLoading: false 
        })
        console.log('User logged in:', data.user.email, 'Role:', data.user.role)
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

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        if (parsedUser && parsedUser.email) {
          set({ user: parsedUser, token, isAuthenticated: true })
          console.log('Auth restored:', parsedUser.email, 'Role:', parsedUser.role)
          return true
        }
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
    set({ isAuthenticated: false, user: null, token: null })
    return false
  },

  isAdmin: () => {
    const { user } = get()
    const isUserAdmin = user?.role === 'ADMIN' || user?.role === 'admin'
    console.log('isAdmin check:', isUserAdmin, 'User role:', user?.role)
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
