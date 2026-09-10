import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import './AdminDashboard.css'

function AdminDashboard() {
  return (
    <div>
      <Nav title="Admin Dashboard" />
      <div className="dashboard-content">
        <h2>Welcome, Admin</h2>
        <p className="dashboard-subtitle">Manage students and companies from here.</p>

        <div className="dashboard-cards">
          <Link to="/admin/students" className="dashboard-card">
            <h3>Students</h3>
            <p>View, filter, and manage student records</p>
          </Link>

          <Link to="/admin/companies" className="dashboard-card">
            <h3>Companies</h3>
            <p>View and manage registered companies</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard