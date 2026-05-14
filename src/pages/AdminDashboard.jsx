import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, MapPin, Star, Heart, Settings, 
  CheckCircle, XCircle, Trash2, Eye, 
  Loader2, Search, Filter, Clock, 
  UserCheck, UserX, Edit, Save, Plus,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useDarkMode } from '../context/DarkModeContext'
import { toast } from 'sonner'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  const { isDarkMode } = useDarkMode()
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('places')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
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
  
  // Action loading states
  const [actionLoading, setActionLoading] = useState(null)

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const [placesRes, usersRes, pendingRes, reviewsRes, statsRes] = await Promise.all([
        fetch(apiUrl + '/admin/places', { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(apiUrl + '/admin/users', { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(apiUrl + '/admin/places/pending', { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(apiUrl + '/admin/reviews', { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(apiUrl + '/admin/stats', { headers: { 'Authorization': 'Bearer ' + token } })
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
    setActionLoading('approve-' + placeId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(apiUrl + '/admin/places/' + placeId + '/approve', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      
      if (!response.ok) throw new Error('Approval failed')
      
      toast.success('Place approved!')
      await loadDashboardData()
    } catch (error) {
      toast.error('Failed to approve place')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectPlace = async (placeId) => {
    if (!confirm('Are you sure you want to reject this place?')) return
    
    setActionLoading('reject-' + placeId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(apiUrl + '/admin/places/' + placeId + '/reject', {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      
      if (!response.ok) throw new Error('Rejection failed')
      
      toast.success('Place rejected')
      await loadDashboardData()
    } catch (error) {
      toast.error('Failed to reject place')
    } finally {
      setActionLoading(null)
    }
  }

  const deletePlace = async (placeId) => {
    if (!confirm('Are you sure you want to delete this place? This action cannot be undone.')) return
    
    setActionLoading('delete-place-' + placeId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(apiUrl + '/admin/places/' + placeId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      
      if (!response.ok) throw new Error('Deletion failed')
      
      toast.success('Place deleted')
      await loadDashboardData()
    } catch (error) {
      toast.error('Failed to delete place')
    } finally {
      setActionLoading(null)
    }
  }

  const updateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    
    setActionLoading('role-' + userId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(apiUrl + '/admin/users/' + userId + '/role', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) throw new Error('Update failed')
      
      toast.success('User role updated to ' + newRole)
      await loadDashboardData()
    } catch (error) {
      toast.error('Failed to update user role')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId, userName) => {
    if (!confirm('Are you sure you want to delete user "' + userName + '"? This action cannot be undone.')) return
    
    setActionLoading('delete-user-' + userId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(apiUrl + '/admin/users/' + userId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      
      if (!response.ok) throw new Error('Deletion failed')
      
      toast.success('User deleted')
      await loadDashboardData()
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    setActionLoading('delete-review-' + reviewId)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      
      const response = await fetch(apiUrl + '/admin/reviews/' + reviewId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      })
      
      if (!response.ok) throw new Error('Deletion failed')
      
      toast.success('Review deleted')
      await loadDashboardData()
    } catch (error) {
      toast.error('Failed to delete review')
    } finally {
      setActionLoading(null)
    }
  }

  const getFilteredData = () => {
    let data = []
    if (activeTab === 'places') data = places
    else if (activeTab === 'users') data = users
    else if (activeTab === 'pending') data = pendingPlaces
    else if (activeTab === 'reviews') data = reviews
    else return []
    
    if (search) {
      const searchLower = search.toLowerCase()
      data = data.filter(function(item) {
        if (activeTab === 'places') {
          return (item.name && item.name.toLowerCase().includes(searchLower)) ||
                 (item.city && item.city.toLowerCase().includes(searchLower))
        }
        if (activeTab === 'users') {
          return (item.name && item.name.toLowerCase().includes(searchLower)) ||
                 (item.email && item.email.toLowerCase().includes(searchLower))
        }
        if (activeTab === 'pending') {
          return (item.name && item.name.toLowerCase().includes(searchLower)) ||
                 (item.submittedBy && item.submittedBy.toLowerCase().includes(searchLower))
        }
        if (activeTab === 'reviews') {
          return (item.comment && item.comment.toLowerCase().includes(searchLower)) ||
                 (item.userName && item.userName.toLowerCase().includes(searchLower)) ||
                 (item.placeName && item.placeName.toLowerCase().includes(searchLower))
        }
        return true
      })
    }
    
    return data
  }

  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const tabs = [
    { id: 'places', label: 'Places', icon: MapPin, count: stats.totalPlaces, colorClass: 'bg-blue-600' },
    { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers, colorClass: 'bg-green-600' },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pendingApprovals, colorClass: 'bg-orange-600' },
    { id: 'reviews', label: 'Reviews', icon: Star, count: stats.totalReviews, colorClass: 'bg-purple-600' }
  ]

  if (loading) {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen' },
      React.createElement(Loader2, { className: 'w-8 h-8 animate-spin text-purple-600' })
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Dashboard
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Manage places, users, and reviews
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tabs.map(function(tab) {
            return React.createElement(
              'div',
              {
                key: tab.id,
                onClick: function() { setActiveTab(tab.id); setCurrentPage(1); setSearch(''); },
                className: 'p-4 rounded-xl cursor-pointer transition-all transform hover:scale-105 ' + 
                  (activeTab === tab.id 
                    ? tab.colorClass + ' text-white shadow-lg'
                    : (isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'))
              },
              React.createElement(
                'div',
                { className: 'flex items-center justify-between' },
                React.createElement(
                  'div',
                  null,
                  React.createElement('p', { className: (activeTab === tab.id ? 'text-white/80' : 'text-gray-500') + ' text-sm' }, tab.label),
                  React.createElement('p', { className: 'text-2xl font-bold' }, tab.count)
                ),
                React.createElement(tab.icon, { className: 'w-8 h-8 ' + (activeTab === tab.id ? 'text-white/80' : 'text-gray-400') })
              )
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={'Search ' + activeTab + '...'}
              value={search}
              onChange={function(e) { setSearch(e.target.value); setCurrentPage(1); }}
              className={'w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none ' +
                (isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200')}
            />
          </div>
        </div>

        {/* Content Tables */}
        <div className={'rounded-xl shadow-lg overflow-hidden ' + (isDarkMode ? 'bg-gray-800' : 'bg-white')}>
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
                  {paginatedData.map(function(place) {
                    return React.createElement(
                      'tr',
                      { key: place.id, className: 'hover:bg-gray-50 dark:hover:bg-gray-700/50' },
                      React.createElement('td', { className: 'px-6 py-4 font-medium' }, place.name),
                      React.createElement('td', { className: 'px-6 py-4' }, place.city || 'N/A'),
                      React.createElement('td', { className: 'px-6 py-4' }, 
                        React.createElement('div', { className: 'flex items-center gap-1' },
                          React.createElement(Star, { className: 'w-4 h-4 fill-yellow-400 text-yellow-400' }),
                          place.averageRating || place.rating || 'N/A'
                        )
                      ),
                      React.createElement('td', { className: 'px-6 py-4' },
                        React.createElement('span', { className: 'px-2 py-1 text-xs rounded-full ' + (place.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700') },
                          place.status || 'APPROVED'
                        )
                      ),
                      React.createElement('td', { className: 'px-6 py-4' },
                        React.createElement('div', { className: 'flex gap-2' },
                          React.createElement('button', { onClick: function() { navigate('/place/' + place.id); }, className: 'p-1 text-blue-600 hover:bg-blue-50 rounded', title: 'View' },
                            React.createElement(Eye, { className: 'w-4 h-4' })
                          ),
                          React.createElement('button', { onClick: function() { deletePlace(place.id); }, disabled: actionLoading === 'delete-place-' + place.id, className: 'p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50', title: 'Delete' },
                            actionLoading === 'delete-place-' + place.id ? React.createElement(Loader2, { className: 'w-4 h-4 animate-spin' }) : React.createElement(Trash2, { className: 'w-4 h-4' })
                          )
                        )
                      )
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Table - Simplified */}
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
                  {paginatedData.map(function(user) {
                    return React.createElement(
                      'tr',
                      { key: user.id, className: 'hover:bg-gray-50 dark:hover:bg-gray-700/50' },
                      React.createElement('td', { className: 'px-6 py-4 font-medium' }, user.name || 'N/A'),
                      React.createElement('td', { className: 'px-6 py-4' }, user.email),
                      React.createElement('td', { className: 'px-6 py-4' },
                        React.createElement('span', { className: 'px-2 py-1 text-xs rounded-full ' + (user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700') },
                          user.role || 'USER'
                        )
                      ),
                      React.createElement('td', { className: 'px-6 py-4' },
                        React.createElement('div', { className: 'flex gap-2' },
                          React.createElement('button', { onClick: function() { updateUserRole(user.id, user.role); }, disabled: actionLoading === 'role-' + user.id, className: 'p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50', title: user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin' },
                            actionLoading === 'role-' + user.id ? React.createElement(Loader2, { className: 'w-4 h-4 animate-spin' }) : React.createElement(UserCheck, { className: 'w-4 h-4' })
                          ),
                          React.createElement('button', { onClick: function() { deleteUser(user.id, user.name || user.email); }, disabled: actionLoading === 'delete-user-' + user.id, className: 'p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50', title: 'Delete User' },
                            actionLoading === 'delete-user-' + user.id ? React.createElement(Loader2, { className: 'w-4 h-4 animate-spin' }) : React.createElement(Trash2, { className: 'w-4 h-4' })
                          )
                        )
                      )
                    )
                  })}
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
                  {paginatedData.map(function(place) {
                    return React.createElement(
                      'tr',
                      { key: place.id, className: 'hover:bg-gray-50 dark:hover:bg-gray-700/50' },
                      React.createElement('td', { className: 'px-6 py-4 font-medium' }, place.name),
                      React.createElement('td', { className: 'px-6 py-4' }, place.city || 'N/A'),
                      React.createElement('td', { className: 'px-6 py-4' }, place.submittedBy || 'Unknown'),
                      React.createElement('td', { className: 'px-6 py-4' }, new Date(place.createdAt).toLocaleDateString()),
                      React.createElement('td', { className: 'px-6 py-4' },
                        React.createElement('div', { className: 'flex gap-2' },
                          React.createElement('button', { onClick: function() { approvePlace(place.id); }, disabled: actionLoading === 'approve-' + place.id, className: 'p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50', title: 'Approve' },
                            actionLoading === 'approve-' + place.id ? React.createElement(Loader2, { className: 'w-4 h-4 animate-spin' }) : React.createElement(CheckCircle, { className: 'w-4 h-4' })
                          ),
                          React.createElement('button', { onClick: function() { rejectPlace(place.id); }, disabled: actionLoading === 'reject-' + place.id, className: 'p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50', title: 'Reject' },
                            actionLoading === 'reject-' + place.id ? React.createElement(Loader2, { className: 'w-4 h-4 animate-spin' }) : React.createElement(XCircle, { className: 'w-4 h-4' })
                          ),
                          React.createElement('button', { onClick: function() { navigate('/place/' + place.id); }, className: 'p-1 text-blue-600 hover:bg-blue-50 rounded', title: 'View Details' },
                            React.createElement(Eye, { className: 'w-4 h-4' })
                          )
                        )
                      )
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No {activeTab} found</p>
              {search && (
                <button onClick={function() { setSearch(''); }} className="mt-2 text-purple-600 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t dark:border-gray-700">
              <button onClick={function() { setCurrentPage(Math.max(1, currentPage - 1)); }} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button onClick={function() { setCurrentPage(Math.min(totalPages, currentPage + 1)); }} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
