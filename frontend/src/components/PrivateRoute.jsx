import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/Authcontext.jsx'

function PrivateRoute({ children, allowedRole }) {
  const { token, role } = useAuth()
  console.log('PrivateRoute check:', { token, role, allowedRole })

  if (!token || role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute