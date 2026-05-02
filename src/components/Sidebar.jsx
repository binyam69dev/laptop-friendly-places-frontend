import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, MapPin, Heart, PlusCircle, LayoutDashboard, LogIn, LogOut, Menu, X, Settings as SettingsIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const isAdmin = user?.role === 'ADMIN'
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/places', label: 'Places', icon: MapPin },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/contributor', label: 'Contributor', icon: PlusCircle },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarBg = isDarkMode ? 'bg-gray-900' : 'bg-white'
  const sidebarBorder = isDarkMode ? 'border-gray-800' : 'border-gray-200'
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900'
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500'
  const hoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
  const activeBg = isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* User Info */}
      {isAuthenticated && user && (
        <div className={`p-4 mx-4 mt-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-semibold">{user.name?.[0] || user.email?.[0] || 'U'}</span>
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm truncate ${textColor}`}>{user.name || 'User'}</p>
              <p className={`text-xs truncate ${subTextColor}`}>{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className={`text-xs font-semibold mb-3 px-2 ${subTextColor}`}>MENU</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive(item.path) ? activeBg : `${textColor} ${hoverBg}`
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive('/admin') ? activeBg : `${textColor} ${hoverBg}`
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom Section - Settings and Logout */}
      <div className={`border-t ${sidebarBorder}`}>
        {/* Settings - right above logout */}
        {isAuthenticated && (
          <div className="p-4 pb-2">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive('/settings') ? activeBg : `${textColor} ${hoverBg}`
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        )}
        
        {/* Login/Logout Button */}
        <div className="p-4 pt-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-md transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full">
        <div className={`fixed w-64 h-[calc(100vh-4rem)] overflow-y-auto ${sidebarBg} border-r ${sidebarBorder}`}>
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarBg} shadow-2xl`}>
        <div className="pt-16 h-full overflow-y-auto">
          <button
            onClick={() => setIsMobileOpen(false)}
            className={`absolute top-4 right-4 p-2 rounded-lg ${hoverBg}`}
          >
            <X className="w-5 h-5" />
          </button>
          {sidebarContent}
        </div>
      </div>
    </>
  )
}

export default Sidebar
