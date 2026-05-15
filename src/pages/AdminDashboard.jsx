import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, MapPin, Star, Heart, 
  CheckCircle, XCircle, Trash2, Eye, 
  Loader2, Search, Clock, 
  UserCheck, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight, UserPlus, Crown
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('places')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const [places, setPlaces] = useState([])
  const [users, setUsers] = useState([])
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [reviews, setReviews] = useState([])
  const [favoritesList, setFavoritesList] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalFavorites: 0,
    pendingApprovals: 0,
    totalContributors: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const checkAdmin = async () => {
      const adminStatus = isAdmin()
      if (!adminStatus) {
        toast.error('Admin access required')
        navigate('/home')
        return
      }
      loadDashboardData()
    }
    
    checkAdmin()
  }, [isAuthenticated, isAdmin, user, navigate])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const [placesRes, usersRes, pendingRes, reviewsRes, statsRes, favoritesRes] = await Promise.all([
        fetch(`${apiUrl}/admin/places`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/places/pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/reviews`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/favorites`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ json: () => [] }))
      ])
      
      if (placesRes.status === 401 || usersRes.status === 401) {
        logout()
        navigate('/login')
        toast.error('Session expired. Please login again.')
        return
      }
      
      const placesData = await placesRes.json()
      const usersData = await usersRes.json()
      const pendingData = await pendingRes.json()
      const reviewsData = await reviewsRes.json()
      const statsData = await statsRes.json()
      const favoritesData = await favoritesRes.json()
      
      // Calculate contributors count (users who have submitted places)
      const contributorsCount = usersData.filter(u => u.submittedPlaces && u.submittedPlaces.length > 0).length
      
      setPlaces(Array.isArray(placesData) ? placesData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setPendingPlaces(Array.isArray(pendingData) ? pendingData : [])
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      setFavoritesList(Array.isArray(favoritesData) ? favoritesData : [])
      setStats({
        ...statsData,
        totalContributors: contributorsCount
      })
      
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
      setPlaces([])
      setUsers([])
      setPendingPlaces([])
      setReviews([])
      setFavoritesList([])
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
    toast.success('Dashboard refreshed')
  }

  const approvePlace = async (placeId) => {
    setActionLoading(placeId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(`${apiUrl}/admin/places/${placeId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to approve place')
      
      toast.success('Place approved successfully')
      await loadDashboardData()
    } catch (error) {
      console.error('Error approving place:', error)
      toast.error('Failed to approve place')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectPlace = async (placeId) => {
    setActionLoading(placeId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(`${apiUrl}/admin/places/${placeId}/reject`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to reject place')
      
      toast.success('Place rejected and removed')
      await loadDashboardData()
    } catch (error) {
      console.error('Error rejecting place:', error)
      toast.error('Failed to reject place')
    } finally {
      setActionLoading(null)
    }
  }

  const updateUserRole = async (userId, currentRole) => {
    setActionLoading(userId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      // Cycle through roles: user -> contributor -> admin -> user
      let newRole = 'user'
      if (currentRole === 'user') newRole = 'contributor'
      else if (currentRole === 'contributor') newRole = 'admin'
      else if (currentRole === 'admin') newRole = 'user'
      
      const response = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) throw new Error('Failed to update user role')
      
      toast.success(`User role updated to ${newRole}`)
      await loadDashboardData()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteItem = async (itemId) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}? This action cannot be undone.`)) {
      return
    }
    
    setActionLoading(itemId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      let endpoint = ''
      let method = 'DELETE'
      
      switch(activeTab) {
        case 'places':
          endpoint = `${apiUrl}/admin/places/${itemId}`
          break
        case 'users':
          endpoint = `${apiUrl}/admin/users/${itemId}`
          break
        case 'reviews':
          endpoint = `${apiUrl}/admin/reviews/${itemId}`
          break
        case 'favorites':
          endpoint = `${apiUrl}/admin/favorites/${itemId}`
          break
        case 'pending':
          endpoint = `${apiUrl}/admin/places/${itemId}/reject`
          break
        default:
          throw new Error('Invalid tab')
      }
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error(`Failed to delete ${activeTab.slice(0, -1)}`)
      
      toast.success(`${activeTab.slice(0, -1)} deleted successfully`)
      await loadDashboardData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error(`Failed to delete ${activeTab.slice(0, -1)}`)
    } finally {
      setActionLoading(null)
    }
  }

  const getFilteredData = () => {
    let data = []
    if (activeTab === 'places') data = places || []
    else if (activeTab === 'users') data = users || []
    else if (activeTab === 'pending') data = pendingPlaces || []
    else if (activeTab === 'reviews') data = reviews || []
    else if (activeTab === 'favorites') data = favoritesList || []
    else return []
    
    if (search && data.length > 0) {
      const s = search.toLowerCase()
      data = data.filter(item => {
        if (activeTab === 'places') return (item.name || '').toLowerCase().includes(s) || (item.city || '').toLowerCase().includes(s)
        if (activeTab === 'users') return (item.name || '').toLowerCase().includes(s) || (item.email || '').toLowerCase().includes(s)
        if (activeTab === 'pending') return (item.name || '').toLowerCase().includes(s) || (item.submittedBy || '').toLowerCase().includes(s)
        if (activeTab === 'reviews') return (item.comment || '').toLowerCase().includes(s) || (item.userName || '').toLowerCase().includes(s) || (item.placeName || '').toLowerCase().includes(s)
        if (activeTab === 'favorites') return (item.placeName || '').toLowerCase().includes(s) || (item.userName || '').toLowerCase().includes(s)
        return true
      })
    }
    return data
  }

  const filteredData = getFilteredData()
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage)
  const paginatedData = (filteredData || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const statsCards = [
    { id: 'places', label: 'Total Places', value: stats.totalPlaces || 0, icon: MapPin, iconColor: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'users', label: 'Total Users', value: stats.totalUsers || 0, icon: Users, iconColor: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'reviews', label: 'Total Reviews', value: stats.totalReviews || 0, icon: Star, iconColor: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'favorites', label: 'Total Favorites', value: stats.totalFavorites || 0, icon: Heart, iconColor: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    { id: 'pending', label: 'Pending Approvals', value: stats.pendingApprovals || 0, icon: Clock, iconColor: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' }
  ]

  const tabs = [
    { id: 'places', label: 'Places', icon: MapPin, count: stats.totalPlaces || 0 },
    { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers || 0 },
    { id: 'reviews', label: 'Reviews', icon: Star, count: stats.totalReviews || 0 },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: stats.totalFavorites || 0 },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pendingApprovals || 0 }
  ]

  const renderTableRow = (item) => {
    switch(activeTab) {
      case 'places':
        return (
          <>
            <td className="px-6 py-4">
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name || 'N/A'}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {item.id}</div>
                {item.submittedBy && (
                  <div className="text-xs text-purple-600 mt-1">Contributor: {item.submittedBy}</div>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                <div>📍 {item.city || 'N/A'}, {item.country || 'N/A'}</div>
                <div className="text-sm">Category: {item.category || 'N/A'}</div>
                {item.images && item.images.length > 0 && (
                  <div className="text-xs mt-1">📸 {item.images.length} photos</div>
                )}
                {item.videos && item.videos.length > 0 && (
                  <div className="text-xs">🎥 {item.videos.length} videos</div>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'approved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {item.status || 'pending'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/place/${item.id}`)} 
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteItem(item.id)} 
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </td>
          </>
        )
      
      case 'users':
        return (
          <>
            <td className="px-6 py-4">
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name || 'N/A'}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.email || 'N/A'}</div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                <div>Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</div>
                <div className="text-sm mt-1">
                  {item.submittedPlaces && item.submittedPlaces.length > 0 
                    ? `📝 Submitted ${item.submittedPlaces.length} places`
                    : 'No submissions yet'}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                  : item.role === 'contributor'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {item.role === 'admin' && <Crown className="w-3 h-3 inline mr-1" />}
                {item.role === 'contributor' && <UserPlus className="w-3 h-3 inline mr-1" />}
                {item.role || 'user'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => updateUserRole(item.id, item.role)} 
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title={`Change Role (${item.role} → ${item.role === 'admin' ? 'user' : item.role === 'contributor' ? 'admin' : 'contributor'})`}
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => deleteItem(item.id)} 
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </td>
          </>
        )
      
      case 'pending':
        return (
          <>
            <td className="px-6 py-4">
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name || 'N/A'}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Submitted by: {item.submittedBy || 'Unknown'}
                  {item.contributorEmail && <span className="text-xs"> ({item.contributorEmail})</span>}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                <div>📍 {item.city || 'N/A'}</div>
                <div className="text-sm">Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</div>
                {item.images && item.images.length > 0 && (
                  <div className="text-xs mt-1">📸 {item.images.length} images attached</div>
                )}
                {item.videos && item.videos.length > 0 && (
                  <div className="text-xs">🎥 {item.videos.length} videos attached</div>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                Pending Review
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => approvePlace(item.id)} 
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Approve"
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => rejectPlace(item.id)} 
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Reject"
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => navigate(`/place/${item.id}`)} 
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </td>
          </>
        )
      
      case 'reviews':
        return (
          <>
            <td className="px-6 py-4">
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.placeName || `Place ID: ${item.placeId}`}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  By: {item.userName || `User ID: ${item.userId}`}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{item.rating}/5</span>
                </div>
                <div className="text-sm mt-1">{item.comment?.substring(0, 100)}{item.comment?.length > 100 ? '...' : ''}</div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'approved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {item.status || 'approved'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => deleteItem(item.id)} 
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Review"
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </td>
          </>
        )
      
      case 'favorites':
        return (
          <>
            <td className="px-6 py-4">
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.placeName || 'N/A'}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Place ID: {item.placeId}</div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                <div>Added by: {item.userName || `User ID: ${item.userId}`}</div>
                <div className="text-sm">Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                Favorite
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => deleteItem(item.id)} 
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove Favorite"
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                </button>
              </div>
            </td>
          </>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Manage places, users, reviews, and favorites</p>
          </div>
          <button 
            onClick={refreshData} 
            disabled={refreshing} 
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statsCards.map(card => (
            <div
              key={card.id}
              onClick={() => { setActiveTab(card.id); setCurrentPage(1); setSearch(''); }}
              className={`p-4 rounded-xl shadow-lg cursor-pointer transition-all transform hover:scale-105 ${
                activeTab === card.id 
                  ? 'ring-2 ring-purple-500 shadow-purple-200 dark:shadow-none' 
                  : isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{card.label}</p>
                  <p className={`text-2xl font-bold ${activeTab === card.id ? 'text-purple-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
                activeTab === tab.id 
                  ? 'border-b-2 border-purple-600 text-purple-600 -mb-px' 
                  : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id 
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                    : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none transition-all ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          />
        </div>

        <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name / Title
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No {activeTab} found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                      {renderTableRow(item)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className={`flex justify-between items-center px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1} 
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 disabled:hover:bg-transparent' 
                    : 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages} 
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 disabled:hover:bg-transparent' 
                    : 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard