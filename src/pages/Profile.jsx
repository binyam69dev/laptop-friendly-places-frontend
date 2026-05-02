import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, LogOut, Shield } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isDarkMode } = useDarkMode()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">{user.name?.[0] || user.email?.[0] || 'U'}</div>
            <h1 className="text-2xl font-bold">{user.name || 'User'}</h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
            <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full"><Shield className="w-3 h-3 text-purple-600" /><span className="text-xs text-purple-600 capitalize">{user.role?.toLowerCase() || 'user'}</span></div>
          </div>
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><User className="w-5 h-5 text-purple-600" /><div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{user.name || 'Not set'}</p></div></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><Mail className="w-5 h-5 text-purple-600" /><div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{user.email}</p></div></div>
          </div>
          <button onClick={handleLogout} className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
