import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const { isDarkMode } = useDarkMode()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [resetSuccess, setResetSuccess] = useState(false)

  // Verify token on load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('No reset token provided')
        setVerifying(false)
        return
      }
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const response = await fetch(`${apiUrl}/auth/verify-reset-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        
        const data = await response.json()
        
        if (response.ok && data.valid) {
          setValidToken(true)
        } else {
          toast.error(data.error || 'Invalid or expired reset link')
          setValidToken(false)
        }
      } catch (error) {
        console.error('Token verification failed:', error)
        toast.error('Failed to verify reset link')
        setValidToken(false)
      } finally {
        setVerifying(false)
      }
    }
    
    verifyToken()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: formData.password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResetSuccess(true)
        toast.success('Password reset successfully!')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const inputClass = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'

  if (verifying) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass} p-4`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 text-center ${cardClass}`}>
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-500">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (!validToken) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass} p-4`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 text-center ${cardClass}`}>
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
          <p className="text-gray-500 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Request New Link
          </button>
        </div>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass} p-4`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 text-center ${cardClass}`}>
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
          <p className="text-gray-500 mb-4">
            Your password has been successfully reset.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Redirecting you to login...
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClass} p-4`}>
      <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 ${cardClass}`}>
        <div className="text-center mb-8">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Password
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${inputClass}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${inputClass}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
