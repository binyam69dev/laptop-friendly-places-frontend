import { useDarkMode } from '../../context/DarkModeContext'

const Logo = ({ size = 'md' }) => {
  const { isDarkMode } = useDarkMode()
  
  const sizes = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
    xl: 'w-12 h-12 text-xl'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg`}>
        <span className="text-white">??</span>
      </div>
      <div>
        <span className={`font-bold ${textSizes[size]} bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
          LaptopFriendly
        </span>
        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hidden sm:block`}>
          Find your workspace
        </p>
      </div>
    </div>
  )
}

export default Logo
