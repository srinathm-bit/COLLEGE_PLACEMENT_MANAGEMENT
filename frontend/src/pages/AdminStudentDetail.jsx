import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminStudentDetail.css'

function AdminStudentDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/api/admin/students/${id}/details`),
      api.get('/api/admin/departments'),
    ])
      .then(([detailRes, deptRes]) => {
        setData(detailRes.data)
        setDepartments(deptRes.data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  function departmentCode(deptId) {
    const dept = departments.find((d) => d.id === deptId)
    return dept ? dept.code : deptId
  }

  function skillTags(skills) {
    if (!skills || (Array.isArray(skills) && skills.length === 0)) return <span className="muted-text">—</span>
    const list = Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean)
    return list.map((s, i) => <span key={i} className="tag tag-accent">{s}</span>)
  }

  function statusBadgeClass(status) {
    if (status === 'selected') return 'badge-green'
    if (status === 'rejected') return 'badge-red'
    if (status === 'shortlisted') return 'badge-amber'
    if (status === 'interview_scheduled') return 'badge-teal'
    return 'badge-blue'
  }

  async function downloadResume(filename) {
    try {
      const res = await api.get(`/api/admin/students/${id}/resume`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || 'resume'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Nav role="admin" title="Admin" />
        <main className="main-content"><div className="empty-state">Loading...</div></main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="app-layout">
        <Nav role="admin" title="Admin" />
        <main className="main-content">
          <Link to="/admin/students" className="back-link">← Back to Students</Link>
          <p className="error-message">{error || 'Student not found.'}</p>
        </main>
      </div>
    )
  }

  const { student, applications, placements } = data
  const isPlaced = placements.length > 0

  return (
    <div className="app-layout">
      <Nav role="admin" title="Admin" />
      <main className="main-content">
        <Link to="/admin/students" className="back-link">← Back to Students</Link>

        <div className="detail-header">
          <div className="detail-avatar">{student.full_name?.charAt(0)}</div>
          <div>
            <h1>{student.full_name}</h1>
            <p className="page-subtitle">{student.roll_number} · {departmentCode(student.department_id)}</p>
          </div>
          <span className={`badge badge-lg ${isPlaced ? 'badge-green' : 'badge-gray'}`}>
            {isPlaced ? 'Placed' : 'Not placed yet'}
          </span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="panel-card">
          <h3>Profile</h3>
          <div className="info-grid">
            <div className="info-item"><span className="info-label">Email</span><span>{student.email}</span></div>
            <div className="info-item"><span className="info-label">Phone</span><span>{student.phone || '—'}</span></div>
            <div className="info-item"><span className="info-label">Department</span><span>{departmentCode(student.department_id)}</span></div>
            <div className="info-item"><span className="info-label">Graduation Year</span><span>{student.graduation_year}</span></div>
            <div className="info-item"><span className="info-label">CGPA</span><span>{student.cgpa}</span></div>
            <div className="info-item">
              <span className="info-label">Active Backlogs</span>
              <span><span className={`badge ${student.active_backlogs > 0 ? 'badge-amber' : 'badge-green'}`}>{student.active_backlogs}</span></span>
            </div>
          </div>
          <div className="info-block">
            <span className="info-label">Skills</span>
            <div>{skillTags(student.skills)}</div>
          </div>
          <div className="info-block">
            <span className="info-label">Resume</span>
            {student.resume_filename ? (
              <div className="resume-row">
                <span>📄 {student.resume_filename}</span>
                <button className="btn-outline" onClick={() => downloadResume(student.resume_filename)}>Download</button>
              </div>
            ) : (
              <span className="muted-text">No resume uploaded</span>
            )}
          </div>
        </div>

        <div className="panel-card">
          <h3>Placement Details</h3>
          {placements.length === 0 ? (
            <div className="empty-state">This student hasn't been selected by any company yet.</div>
          ) : (
            <div className="placement-list">
              {placements.map((p) => (
                <div key={p.application_id} className="placement-item">
                  <div>
                    <p className="placement-role">{p.job_title}</p>
                    <p className="muted-text">{p.company_name}</p>
                  </div>
                  <div className="placement-meta">
                    <span className="badge badge-green">Selected</span>
                    {p.interview_result && p.interview_result !== 'pending' && (
                      <span className="muted-text">Interview: {p.interview_result}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-card">
          <h3>Applied Jobs ({applications.length})</h3>
          {applications.length === 0 ? (
            <div className="empty-state">This student hasn't applied to any jobs yet.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Job Role</th><th>Company</th><th>Status</th><th>Applied On</th><th>Interview</th></tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.application_id}>
                      <td className="cell-strong">{a.job_title}</td>
                      <td>{a.company_name}</td>
                      <td><span className={`badge ${statusBadgeClass(a.status)}`}>{a.status.replace('_', ' ')}</span></td>
                      <td>{new Date(a.applied_at).toLocaleDateString()}</td>
                      <td>
                        {a.interview_scheduled_at ? (
                          <>
                            <span className="cell-sub">{new Date(a.interview_scheduled_at).toLocaleDateString()} ({a.interview_mode})</span>
                            {a.interview_result && a.interview_result !== 'pending' && (
                              <span className={`badge ${a.interview_result === 'passed' ? 'badge-green' : 'badge-red'}`}>{a.interview_result}</span>
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
        </div>
      </main>
    </div>
  )
}

export default AdminStudentDetail