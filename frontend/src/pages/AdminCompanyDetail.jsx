import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminCompanyDetail.css'

function AdminCompanyDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/api/admin/companies/${id}/details`),
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
    return list.map((s, i) => <span key={i} className="tag">{s}</span>)
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Nav role="admin" title="Admin" />
        <main className="main-content"><div className="empty-state">Loading...</div></main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="app-layout">
        <Nav role="admin" title="Admin" />
        <main className="main-content">
          <Link to="/admin/companies" className="back-link">← Back to Companies</Link>
          <p className="error-message">{error || 'Company not found.'}</p>
        </main>
      </div>
    )
  }

  const { company, stats, jobs, placed_students } = data

  const kpis = [
    { label: 'Total Jobs', value: stats.total_jobs },
    { label: 'Applicants', value: stats.total_applicants },
    { label: 'Shortlisted', value: stats.shortlisted },
    { label: 'Selected', value: stats.selected },
    { label: 'Placed Students', value: stats.placed },
  ]

  return (
    <div className="app-layout">
      <Nav role="admin" title="Admin" />
      <main className="main-content">
        <Link to="/admin/companies" className="back-link">← Back to Companies</Link>

        <div className="detail-header">
          <div className="detail-avatar">{company.company_name?.charAt(0)}</div>
          <div>
            <h1>{company.company_name}</h1>
            <p className="page-subtitle">{company.industry || 'Industry not set'}</p>
          </div>
        </div>

        <div className="panel-card">
          <h3>Company Information</h3>
          <div className="info-grid">
            <div className="info-item"><span className="info-label">Email</span><span>{company.email}</span></div>
            <div className="info-item"><span className="info-label">Contact Person</span><span>{company.contact_person || '—'}</span></div>
            <div className="info-item"><span className="info-label">Phone</span><span>{company.contact_phone || '—'}</span></div>
            <div className="info-item">
              <span className="info-label">Website</span>
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="link-accent">{company.website}</a>
              ) : (
                <span>—</span>
              )}
            </div>
          </div>
        </div>

        <div className="kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className="kpi-card">
              <span className="kpi-value">{k.value}</span>
              <span className="kpi-label">{k.label}</span>
            </div>
          ))}
        </div>

        <div className="panel-card">
          <h3>Jobs / Placement Drives</h3>
          {jobs.length === 0 ? (
            <div className="empty-state">This company hasn't posted any jobs yet.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Role</th><th>Min CGPA</th><th>Departments</th><th>Skills</th>
                    <th>Posted</th><th>Applicants</th><th>Shortlisted</th><th>Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}>
                      <td className="cell-strong">{j.title}</td>
                      <td>{j.min_cgpa}</td>
                      <td>{j.department_ids.map((d) => <span key={d} className="badge badge-blue">{departmentCode(d)}</span>)}</td>
                      <td className="tags-cell">{skillTags(j.required_skills)}</td>
                      <td>{new Date(j.created_at).toLocaleDateString()}</td>
                      <td>{j.applicants}</td>
                      <td>{j.shortlisted}</td>
                      <td>{j.selected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel-card">
          <h3>Placed Students</h3>
          {placed_students.length === 0 ? (
            <div className="empty-state">No students placed in this company yet.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Student</th><th>Roll No.</th><th>Department</th><th>CGPA</th><th>Job Role</th></tr>
                </thead>
                <tbody>
                  {placed_students.map((s, i) => (
                    <tr key={`${s.student_id}-${i}`}>
                      <td className="cell-strong">
                        <Link to={`/admin/students/${s.student_id}`} className="link-accent">{s.full_name}</Link>
                      </td>
                      <td>{s.roll_number}</td>
                      <td>{departmentCode(s.department_id)}</td>
                      <td>{s.cgpa}</td>
                      <td><span className="badge badge-green">{s.job_title}</span></td>
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

export default AdminCompanyDetail