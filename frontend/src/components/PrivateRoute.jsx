import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/Authcontext.jsx'

function PrivateRoute({ children, allowedRole }) {
  const { token, role } = useAuth()

  if (!token || role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute