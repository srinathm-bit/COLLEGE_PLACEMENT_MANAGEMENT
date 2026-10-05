import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/Authcontext.jsx'
import './Nav.css'

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', path: '/admin-dashboard', icon: '🏠' },
    { label: 'Students', path: '/admin/students', icon: '🎓' },
    { label: 'Companies', path: '/admin/companies', icon: '🏢' },
    { label: 'Departments', path: '/admin/departments', icon: '📚' },
    { label: 'Placement Overview', path: '/admin/applications', icon: '📋' },
  ],
  student: [
    { label: 'Dashboard', path: '/student-dashboard', icon: '🏠' },
  ],
  company: [
    { label: 'Dashboard', path: '/company-dashboard', icon: '🏠' },
  ],
}

function Nav({ role, title }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const items = NAV_ITEMS[role] || []

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">C</div>
        <span>CPMS</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-role-badge">{title}</span>
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Nav