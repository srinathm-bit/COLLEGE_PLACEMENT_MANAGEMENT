import { useState, useEffect } from 'react'
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
    if (status === 'selected') return 'badge-green'
    if (status === 'rejected') return 'badge-red'
    if (status === 'shortlisted') return 'badge-amber'
    if (status === 'interview_scheduled') return 'badge-teal'
    return 'badge-blue'
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length
    return acc
  }, {})

  return (
    <div className="app-layout">
      <Nav role="admin" title="Admin" />
      <main className="main-content">
        <div className="page-header-row">
          <div>
            <h1>Placement Overview</h1>
            <p className="page-subtitle">All applications across students and companies.</p>
          </div>
        </div>

        <div className="kpi-grid">
          {STATUS_OPTIONS.map((s) => (
            <div key={s} className="kpi-card">
              <span className="kpi-value">{counts[s]}</span>
              <span className="kpi-label">{s.replace('_', ' ')}</span>
            </div>
          ))}
        </div>

        <div className="filter-bar">
          <div className="form-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">No applications found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th><th>Job</th><th>Company</th>
                  <th>Status</th><th>Applied</th><th>Interview</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.application_id}>
                    <td>
                      <span className="cell-strong">{a.student_name}</span>
                      <span className="cell-sub">{a.roll_number}</span>
                    </td>
                    <td>{a.job_title}</td>
                    <td>{a.company_name}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(a.status)}`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td>
                      {a.interview_scheduled_at ? (
                        <>
                          <span className="cell-sub-block">
                            {new Date(a.interview_scheduled_at).toLocaleDateString()} ({a.interview_mode})
                          </span>
                          {a.interview_result && a.interview_result !== 'pending' && (
                            <span className={`badge ${a.interview_result === 'passed' ? 'badge-green' : 'badge-red'}`}>
                              {a.interview_result}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminApplications