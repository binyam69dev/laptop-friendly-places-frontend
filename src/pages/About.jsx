import { Github, Twitter, Globe, Mail, Heart } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

const About = () => {
  const { isDarkMode } = useDarkMode()

  const team = [
    { name: 'Binyam', role: 'Founder & Developer', icon: '??', bio: 'Passionate about creating great workspace experiences' },
  ]

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className={`rounded-2xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>About Us</h1>
          <div className={`w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6`} />

          <div className="prose max-w-none">
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              LaptopFriendly is on a mission to help remote workers, digital nomads, and students find the perfect workspace anywhere in the world.
            </p>

            <h2 className={`text-2xl font-semibold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Our Story</h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Founded in 2025, LaptopFriendly was born from a simple idea: finding a good place to work shouldn't be hard. We've curated thousands of laptop-friendly spots with verified WiFi, plenty of power outlets, and great coffee.
            </p>

            <h2 className={`text-2xl font-semibold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Our Mission</h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              To empower remote workers by connecting them with the best workspaces globally, fostering productivity and community.
            </p>

            <h2 className={`text-2xl font-semibold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>The Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {team.map(member => (
                <div key={member.name} className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl">{member.icon}</div>
                    <div><h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{member.name}</h3><p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.role}</p></div>
                  </div>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.bio}</p>
                </div>
              ))}
            </div>

            <div className={`mt-8 p-6 rounded-xl text-center ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <Heart className="w-8 h-8 text-red-500 fill-red-500 mx-auto mb-2 animate-pulse" />
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Made with love for remote workers worldwide</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>? 2025 LaptopFriendly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
