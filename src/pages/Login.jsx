import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Coffee } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'

const Login = () => {
  const navigate = useNavigate()
  const { login, register, isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const emailInputRef = useRef(null)
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '' 
  })

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkAuth()
    }
  }, [checkAuth])

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/home'
      localStorage.removeItem('redirectAfterLogin')
      navigate(redirectPath)
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    if (!isLogin && !formData.name.trim()) {
      setError('Full name is required')
      return false
    }
    if (!isLogin && formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (!isLogin && !/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one letter and one number')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      let result
      
      if (isLogin) {
        result = await login(formData.email, formData.password, rememberMe)
      } else {
        result = await register(formData.name, formData.email, formData.password)
        if (result.success) {
          result = await login(formData.email, formData.password, rememberMe)
        }
      }
      
      if (!result.success) {
        setError(result.error || 'Authentication failed. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({ name: '', email: '', password: '' })
    setShowPassword(false)
    setTimeout(() => {
      if (emailInputRef.current) emailInputRef.current.focus()
    }, 100)
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'

  return (
    <div className={`${bgClass} min-h-screen flex items-center justify-center p-4`}>
      <div className={`${cardClass} max-w-md w-full rounded-2xl shadow-xl p-8`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Coffee className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`${textClass} text-3xl font-bold mb-2`}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {isLogin ? 'Sign in to find your perfect workspace' : 'Join our community of remote workers'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Full Name" 
                className={`${inputClass} w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition`}
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                disabled={loading || authLoading}
                autoComplete="name"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              ref={emailInputRef}
              type="email" 
              placeholder="Email address" 
              className={`${inputClass} w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition`}
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              disabled={loading || authLoading}
              autoComplete="email"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className={`${inputClass} w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition`}
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              disabled={loading || authLoading}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              tabIndex="-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className={`${textClass} text-sm`}>
                  Remember me
                </span>
              </label>
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-purple-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || authLoading} 
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold"
          >
            {loading || authLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={switchMode}
            className="text-purple-600 hover:underline text-sm"
            disabled={loading || authLoading}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
