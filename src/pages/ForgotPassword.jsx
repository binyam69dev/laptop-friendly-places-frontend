import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const ForgotPassword = () => {
  const { isDarkMode } = useDarkMode()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetLink, setResetLink] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSubmitted(true)
        if (data.resetLink) {
          setResetLink(data.resetLink)
        }
        toast.success(data.message || 'Reset link sent!')
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Password reset request failed:', error)
      toast.error('Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const inputClass = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgClass} p-4`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 text-center ${cardClass}`}>
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-gray-500 mb-4">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Click the link in the email to reset your password. The link expires in 1 hour.
          </p>
          {resetLink && process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Development mode - click to reset:</p>
              <a href={resetLink} className="text-purple-600 text-sm break-all">{resetLink}</a>
            </div>
          )}
          <Link to="/login" className="inline-flex items-center gap-2 text-purple-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClass} p-4`}>
      <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 ${cardClass}`}>
        <div className="text-center mb-8">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Forgot Password?
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${inputClass}`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-purple-600 hover:underline text-sm flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
