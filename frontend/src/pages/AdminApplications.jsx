import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminApplications.css'

const STATUS_OPTIONS = ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected']

function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [statusFilter])

  function fetchApplications() {
    setLoading(true)
    setError('')
    const params = statusFilter ? { status: statusFilter } : {}
    api.get('/api/admin/applications', { params })
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function statusBadgeClass(status) {
    if (status === 'selected') return 'status-selected'
    if (status === 'rejected') return 'status-rejected'
    if (status === 'shortlisted') return 'status-shortlisted'
    if (status === 'interview_scheduled') return 'status-interview'
    return 'status-applied'
  }

  return (
    <div>
      <Nav title="Admin Dashboard" />
      <div className="applications-page">
        <Link to="/admin-dashboard" className="back-link">← Back to Dashboard</Link>

        <div className="applications-header">
          <div>
            <h2>Placement Overview</h2>
            <p className="applications-subtitle">All applications across students and companies.</p>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="applications-error">{error}</p>}

        {loading ? (
          <p className="applications-loading">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="applications-empty">No applications found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Interview</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.application_id}>
                    <td>
                      <span className="student-name-cell">{a.student_name}</span>
                      <span className="student-roll-cell">{a.roll_number}</span>
                    </td>
                    <td>{a.job_title}</td>
                    <td>{a.company_name}</td>
                    <td>
                      <span className={`status-badge ${statusBadgeClass(a.status)}`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td>
                      {a.interview_scheduled_at ? (
                        <>
                          <span className="interview-date-cell">
                            {new Date(a.interview_scheduled_at).toLocaleDateString()} ({a.interview_mode})
                          </span>
                          {a.interview_result && a.interview_result !== 'pending' && (
                            <span className={`status-badge ${a.interview_result === 'passed' ? 'status-selected' : 'status-rejected'}`}>
                              {a.interview_result}
                            </span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminApplications