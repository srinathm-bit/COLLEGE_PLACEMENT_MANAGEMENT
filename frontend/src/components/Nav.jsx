import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Authcontext.jsx'
import './Nav.css'

function Nav({ title }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="app-nav">
      <span className="nav-brand">CPMS — {title}</span>
      <button className="nav-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  )
}

export default Nav