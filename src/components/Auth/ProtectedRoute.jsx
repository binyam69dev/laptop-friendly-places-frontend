import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/home" replace />
  }
  
  return children
}

export default ProtectedRoute
