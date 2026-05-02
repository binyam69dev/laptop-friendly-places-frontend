import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Users, Star, Clock, CheckCircle, XCircle, Eye, Edit, Trash2, Loader2, TrendingUp, Coffee, Wifi, Zap, RefreshCw } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, checkAuth } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalUsers: 0,
    totalReviews: 0,
    pendingPlaces: 0,
    approvedPlaces: 0,
    averageRating: 0
  })
  const [places, setPlaces] = useState([])
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [approvedPlaces, setApprovedPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!isAdmin()) {
      navigate('/home')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated, user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const placesRes = await fetch(`${import.meta.env.VITE_API_URL}/places`, {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      const allPlaces = await placesRes.json()
      
      const approved = allPlaces.filter(p => p.status === 'APPROVED')
      const pending = allPlaces.filter(p => p.status === 'PENDING')
      const totalReviews = allPlaces.reduce((sum, p) => sum + (p.totalReviews || 0), 0)
      const avgRating = allPlaces.length > 0 
        ? allPlaces.reduce((sum, p) => sum + (p.averageRating || 0), 0) / allPlaces.length 
        : 0
      
      setStats({
        totalPlaces: allPlaces.length,
        totalUsers: 0,
        totalReviews: totalReviews,
        pendingPlaces: pending.length,
        approvedPlaces: approved.length,
        averageRating: avgRating
      })
      
      setPlaces(allPlaces)
      setPendingPlaces(pending)
      setApprovedPlaces(approved)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const approvePlace = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/places/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status: 'APPROVED' })
      })
      toast.success('Place approved successfully!')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to approve place')
    }
  }

  const deletePlace = async (id) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`${import.meta.env.VITE_API_URL}/places/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        })
        toast.success('Place deleted successfully!')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete place')
      }
    }
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Not admin - show access denied
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">Admin privileges required</p>
          <Link to="/home" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const statCards = [
    { icon: MapPin, label: 'Total Places', value: stats.totalPlaces, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: Star, label: 'Total Reviews', value: stats.totalReviews, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: TrendingUp, label: 'Average Rating', value: stats.averageRating.toFixed(1), color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  ]

  const getDisplayPlaces = () => {
    if (activeTab === 'pending') return pendingPlaces
    if (activeTab === 'approved') return approvedPlaces
    return places
  }

  const displayPlaces = getDisplayPlaces()

  return (
    <div className={'min-h-screen py-8 ' + (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={'text-3xl font-bold mb-2 ' + textClass}>Admin Dashboard</h1>
            <p className={subTextClass}>Manage places, approve submissions, and monitor activity</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className={'p-6 rounded-xl shadow-md ' + cardClass}>
              <div className={'w-12 h-12 rounded-xl flex items-center justify-center mb-3 ' + stat.bg}>
                <stat.icon className={'w-6 h-6 ' + stat.color} />
              </div>
              <div className={'text-2xl font-bold ' + textClass}>{stat.value}</div>
              <div className={subTextClass}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Pending Approval Summary */}
        {stats.pendingPlaces > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Pending Approvals</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  You have {stats.pendingPlaces} place(s) waiting for your approval
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            All Places ({places.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pending' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Pending ({pendingPlaces.length})
            {pendingPlaces.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {pendingPlaces.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'approved' 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Approved ({approvedPlaces.length})
          </button>
        </div>

        {/* Places Table */}
        <div className={'rounded-xl shadow-md overflow-hidden ' + cardClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={'border-b ' + (isDarkMode ? 'border-gray-700' : 'border-gray-200')}>
                <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayPlaces.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No places found
                    </td>
                  </tr>
                ) : (
                  displayPlaces.map((place) => (
                    <tr key={place.id} className={'border-t ' + (isDarkMode ? 'border-gray-700' : 'border-gray-200')}>
                      <td className="px-6 py-4 text-sm font-medium">{place.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{place.address}, {place.city}</td>
                      <td className="px-6 py-4">
                        {place.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{place.averageRating?.toFixed(1) || 'New'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate('/place/' + place.id)} 
                            className="p-1 text-blue-600 hover:text-blue-800 transition" 
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {place.status !== 'APPROVED' && (
                            <button 
                              onClick={() => approvePlace(place.id)} 
                              className="p-1 text-green-600 hover:text-green-800 transition" 
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => deletePlace(place.id)} 
                            className="p-1 text-red-600 hover:text-red-800 transition" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard