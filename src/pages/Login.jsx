import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'

const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, checkAuth } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  // Check auth but don't auto-redirect immediately
  useEffect(() => {
    checkAuth()
  }, [])

  // Redirect only when authenticated and not on login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home')
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    if (!isLogin && !formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
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
        result = await login(formData.email, formData.password)
      } else {
        const { register } = await import('../services/api')
        const regResult = await register(formData.name, formData.email, formData.password)
        if (regResult.accessToken) {
          result = await login(formData.email, formData.password)
        } else {
          throw new Error(regResult.error || 'Registration failed')
        }
      }
      
      if (result.success) {
        // Navigation handled by useEffect
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClass} p-4`}>
      <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 ${cardClass}`}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">??</div>
          <h1 className={`text-3xl font-bold mb-2 ${textClass}`}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {isLogin ? 'Sign in to continue' : 'Join our community of remote workers'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Full Name" 
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="email" 
              placeholder="Email" 
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${inputClass}`}
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              required 
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="password" 
              placeholder="Password" 
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${inputClass}`}
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => {
            setIsLogin(!isLogin)
            setError('')
            setFormData({ name: '', email: '', password: '' })
          }} className="text-purple-600 hover:underline">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p className="text-gray-600 dark:text-gray-400">?? Admin: admin@laptopfriendly.com / admin123</p>
          <p className="text-gray-600 dark:text-gray-400">?? User: user@example.com / user123</p>
          <p className="text-xs text-gray-500 mt-2">?? You must enter credentials manually</p>
        </div>
      </div>
    </div>
  )
}

export default Login
