import { Link, useNavigate } from 'react-router-dom'
import { Sun, Moon, User, Heart, Coffee } from 'lucide-react'
import usePlaceStore from "../store/usePlaceStore"
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const bgClass = isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'

  return (
    <nav className={`${bgClass} fixed top-0 left-0 right-0 z-50 transition-colors duration-200 border-b shadow-sm`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:inline">
              LaptopFriendly
            </span>
          </Link>

          {/* Right Side - Dark Mode & Profile */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
            </button>

            {/* Profile Section - ALWAYS VISIBLE WHEN LOGGED IN */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/favorites" 
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Favorites"
                >
                  <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </Link>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.[0] || user.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className={`${textClass} hidden md:block text-sm font-medium`}>
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar