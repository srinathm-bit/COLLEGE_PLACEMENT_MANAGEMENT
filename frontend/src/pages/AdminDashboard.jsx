import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import './AdminDashboard.css'

function AdminDashboard() {
  return (
    <div className="app-layout">
      <Nav role="admin" title="Admin" />
      <main className="main-content">
        <div className="page-header">
          <h1>Welcome back, Admin</h1>
          <p className="page-subtitle">Manage students, companies, and the placement process from here.</p>
        </div>

        <div className="dashboard-cards">
          <Link to="/admin/students" className="dashboard-card">
            <div className="card-icon-wrap icon-blue">🎓</div>
            <h3>Students</h3>
            <p>View, filter, and manage student records</p>
          </Link>

          <Link to="/admin/companies" className="dashboard-card">
            <div className="card-icon-wrap icon-purple">🏢</div>
            <h3>Companies</h3>
            <p>View and manage registered companies</p>
          </Link>

          <Link to="/admin/departments" className="dashboard-card">
            <div className="card-icon-wrap icon-amber">📚</div>
            <h3>Departments</h3>
            <p>Add and manage academic departments</p>
          </Link>

          <Link to="/admin/applications" className="dashboard-card">
            <div className="card-icon-wrap icon-green">📋</div>
            <h3>Placement Overview</h3>
            <p>Track applications, statuses and interviews</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
