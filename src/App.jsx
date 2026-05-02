import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import Footer from './components/Footer'
import AnimatedPage from "./components/AnimatedPage"
import ScrollToTop from './components/ScrollToTop'
import './styles/index.css'

const Landing = lazy(() => import('./pages/Landing'))
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const PlaceDetails = lazy(() => import('./pages/PlaceDetails'))
const Profile = lazy(() => import('./pages/Profile'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Contributor = lazy(() => import('./pages/Contributor'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Places = lazy(() => import('./pages/Places'))
const Settings = lazy(() => import('./pages/Settings'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))

function MainLayout({ children }) {
  const { isDarkMode } = useDarkMode()
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      <div className="flex pt-16">
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="fixed w-64 h-[calc(100vh-4rem)] overflow-y-auto"><Sidebar /></div>
        </div>
        <div className="md:hidden"><Sidebar /></div>
        <div className="flex-1 min-w-0">
          <AnimatedPage><main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main></AnimatedPage>
          <Footer />
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/places" element={<MainLayout><Places /></MainLayout>} />
        <Route path="/place/:id" element={<MainLayout><PlaceDetails /></MainLayout>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><MainLayout><Favorites /></MainLayout></ProtectedRoute>} />
        <Route path="/contributor" element={<ProtectedRoute><MainLayout><Contributor /></MainLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <Router><ScrollToTop /><AppContent /></Router>
    </DarkModeProvider>
  )
}

export default App
