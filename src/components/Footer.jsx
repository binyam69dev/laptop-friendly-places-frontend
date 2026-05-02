import { Heart, Github, Twitter, Globe } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

const Footer = () => {
  const { isDarkMode } = useDarkMode()
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { 
      icon: Github, 
      href: 'https://github.com/binyam69dev', 
      label: 'GitHub', 
      username: 'binyam69dev',
      color: 'hover:text-gray-900 dark:hover:text-white' 
    },
    { 
      icon: Twitter, 
      href: 'https://twitter.com/binyam369dev', 
      label: 'Twitter', 
      username: '@binyam369dev',
      color: 'hover:text-blue-400' 
    },
    { 
      icon: Globe, 
      href: 'https://binyam-portfolio.netlify.app/', 
      label: 'Portfolio', 
      username: 'binyam.dev',
      color: 'hover:text-purple-600' 
    },
  ]

  return (
    <footer className={`border-t mt-auto transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800' 
        : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Copyright */}
        <div className="text-center space-y-1">
          <p className={`text-sm font-semibold tracking-wide ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            © {currentYear} Laptop-Friendly Places
          </p>
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            All rights reserved
          </p>
        </div>

        {/* Crafted by */}
        <div className="text-center mt-5">
          <div className="inline-flex items-center justify-center">
            <p className={`text-sm flex items-center gap-2 px-4 py-2 rounded-full ${
              isDarkMode 
                ? 'bg-gray-800/40 text-gray-300' 
                : 'bg-gray-100/60 text-gray-600'
            } backdrop-blur-sm`}>
              <span>Crafted with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 transition-transform hover:scale-110" />
              <span>by</span>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Binyam
              </span>
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 mt-5">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
              } ${social.color}`}
            >
              <social.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-1 transition-all duration-300">
                {social.username}
              </span>
            </a>
          ))}
        </div>

        {/* Bottom Links */}
        <div className={`border-t mt-6 pt-4 text-center ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs">
            {['About', 'Privacy', 'Terms', 'Contact'].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                <a
                  href={`/${item.toLowerCase()}`}
                  className={`transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-purple-400' 
                      : 'text-gray-400 hover:text-purple-600'
                  }`}
                >
                  {item}
                </a>
                {i !== 3 && (
                  <span className={`${
                    isDarkMode ? 'text-gray-600' : 'text-gray-300'
                  }`}>•</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className={`mt-5 text-center ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <p className="text-xs flex items-center justify-center gap-3 flex-wrap">
            <span>🌍 Connecting remote workers worldwide</span>
            <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
            <span>💻 Find your perfect workspace</span>
            <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
            <span>☕ Work from anywhere</span>
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer