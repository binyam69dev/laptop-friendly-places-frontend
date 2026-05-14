import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, MapPin, Star, Heart, Settings, 
  CheckCircle, XCircle, Trash2, Eye, 
  Loader2, Search, Filter, Clock, 
  UserCheck, UserX, Edit, Save, Plus
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('places')
  const [search, setSearch] = useState('')
  
  // Data states
  const [places, setPlaces] = useState([])
  const [users, setUsers] = useState([])
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalFavorites: 0,
    pendingApprovals: 0
  })

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (!isAdmin()) {
      toast.error('Admin access required')
      navigate('/home')
    } else {
      loadDashboardData()
    }
  }, [isAuthenticated, isAdmin, navigate])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      // Load all data in parallel
      const [placesRes, usersRes, pendingRes, reviewsRes, statsRes] = await Promise.all([
        fetch(`${apiUrl}/admin/places`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/places/pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/reviews`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      
      const placesData = await placesRes.json()
      const usersData = await usersRes.json()
      const pendingData = await pendingRes.json()
      const reviewsData = await reviewsRes.json()
      const statsData = await statsRes.json()
      
      setPlaces(Array.isArray(placesData) ? placesData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setPendingPlaces(Array.isArray(pendingData) ? pendingData : [])
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      setStats(statsData)
      
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
      // Load mock data for demo
      loadMockData()
    } finally {
      setLoading(false)
    }
  }
  
  const loadMockData = () => {
    setPlaces([
      { id: 1, name: 'Starbucks Downtown', city: 'New York', rating: 4.5, status: 'approved' },
      { id: 2, name: 'Central Library', city: 'Boston', rating: 4.8, status: 'approved' }
    ])
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
      { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' }
    ])
    setPendingPlaces([
      { id: 101, name: 'New Coffee Shop', city: 'Chicago', submittedBy: 'john@example.com', submittedAt: new Date().toISOString() }
    ])
    setStats({
      totalPlaces: 45,
      totalUsers: 128,
      totalReviews: 342,
      totalFavorites: 567,
      pendingApprovals: 3
    })
  }

  const approvePlace = async (placeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/places/${placeId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Approval failed')
      
      toast.success('Place approved!')
      setPendingPlaces(prev => prev.filter(p => p.id !== placeId))
      setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1, totalPlaces: prev.totalPlaces + 1 }))
    } catch (error) {
      toast.error('Failed to approve place')
    }
  }

  const rejectPlace = async (placeId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/places/${placeId}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Rejection failed')
      
      toast.success('Place rejected and removed')
      setPendingPlaces(prev => prev.filter(p => p.id !== placeId))
      setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }))
    } catch (error) {
      toast.error('Failed to reject place')
    }
  }

  const deletePlace = async (placeId) => {
    if (!confirm('Are you sure you want to delete this place?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/places/${placeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Deletion failed')
      
      toast.success('Place deleted')
      setPlaces(prev => prev.filter(p => p.id !== placeId))
      setStats(prev => ({ ...prev, totalPlaces: prev.totalPlaces - 1 }))
    } catch (error) {
      toast.error('Failed to delete place')
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) throw new Error('Update failed')
      
      toast.success(`User role updated to ${newRole}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Deletion failed')
      
      toast.success('User deleted')
      setUsers(prev => prev.filter(u => u.id !== userId))
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Deletion failed')
      
      toast.success('Review deleted')
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      setStats(prev => ({ ...prev, totalReviews: prev.totalReviews - 1 }))
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const filteredData = () => {
    if (activeTab === 'places') {
      return places.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (activeTab === 'users') {
      return users.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (activeTab === 'pending') {
      return pendingPlaces.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.submittedBy?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (activeTab === 'reviews') {
      return reviews.filter(r => 
        r.comment?.toLowerCase().includes(search.toLowerCase()) ||
        r.userName?.toLowerCase().includes(search.toLowerCase())
      )
    }
    return []
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const inputClass = isDarkMode 
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-purple-500' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-500'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const tabs = [
    { id: 'places', label: 'Places', icon: MapPin, count: stats.totalPlaces },
    { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pendingApprovals },
    { id: 'reviews', label: 'Reviews', icon: Star, count: stats.totalReviews }
  ]

  return (
    <div className={`${bgClass} min-h-screen py-8`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`${textClass} text-3xl font-bold`}>
            Admin Dashboard
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Manage places, users, and reviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className={`${cardClass} p-4 rounded-xl shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Places</p>
                <p className="text-2xl font-bold">{stats.totalPlaces}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className={`${cardClass} p-4 rounded-xl shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className={`${cardClass} p-4 rounded-xl shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className={`${cardClass} p-4 rounded-xl shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Favorites</p>
                <p className="text-2xl font-bold">{stats.totalFavorites}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className={`${cardClass} p-4 rounded-xl shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${activeTab === tab.id 
                ? 'border-b-2 border-purple-600 text-purple-600' 
                : `${textClass} hover:bg-gray-100 dark:hover:bg-gray-800`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none transition`}
            />
          </div>
        </div>

        {/* Content Tables */}
        <div className={`${cardClass} rounded-xl shadow-lg overflow-hidden`}>
          {/* Places Table */}
          {activeTab === 'places' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData().map((place) => (
                    <tr key={place.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">{place.name}</td>
                      <td className="px-6 py-4">{place.city}</td>
                      <td className="px-6 py-4">{place.rating || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          {place.status || 'approved'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/place/${place.id}`)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePlace(place.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Table */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData().map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className={`${inputClass} px-2 py-1 rounded border`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="contributor">Contributor</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending Places Table */}
          {activeTab === 'pending' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Submitted By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData().map((place) => (
                    <tr key={place.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">{place.name}</td>
                      <td className="px-6 py-4">{place.city}</td>
                      <td className="px-6 py-4">{place.submittedBy}</td>
                      <td className="px-6 py-4">{new Date(place.submittedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approvePlace(place.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectPlace(place.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/place/${place.id}`)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews Table */}
          {activeTab === 'reviews' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Place</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData().map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">{review.placeName}</td>
                      <td className="px-6 py-4">{review.userName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {review.rating}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">{review.comment}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {filteredData().length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No {activeTab} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard