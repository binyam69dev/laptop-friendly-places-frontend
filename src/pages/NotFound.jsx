import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

const NotFound = () => {
  const { isDarkMode } = useDarkMode()

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="text-center px-4">
        <div className="text-9xl font-bold text-purple-600 mb-4">404</div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Page Not Found
        </h1>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/home" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-md transition">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link to="/places" className="flex items-center gap-2 px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition">
            <Search className="w-4 h-4" /> Browse Places
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
