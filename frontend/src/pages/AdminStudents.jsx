import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminStudents.css'


function AdminStudents() {
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [graduationYear, setGraduationYear] = useState('')

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', roll_number: '',
    department_id: '', graduation_year: '', cgpa: '', active_backlogs: '',
    phone: '', skills: '',
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/api/admin/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    setError('')

    if (!departmentId && !graduationYear) {
      setError('Please select at least one filter: department or graduation year.')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const params = {}
      if (departmentId) params.department_id = departmentId
      if (graduationYear) params.graduation_year = graduationYear

      const res = await api.get('/api/admin/students', { params })
      setStudents(res.data)
    } catch (err) {
      setError(err.message)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(studentId) {
    if (!window.confirm('Are you sure you want to delete this student?')) return
    try {
      await api.delete(`/api/admin/students/${studentId}`)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
    } catch (err) {
      setError(err.message)
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleAddStudent(e) {
    e.preventDefault()
    setFormError('')

    if (!formData.department_id) {
      setFormError('Please select a department.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/auth/student/register', {
        ...formData,
        department_id: parseInt(formData.department_id),
        graduation_year: parseInt(formData.graduation_year) || 0,
        cgpa: parseFloat(formData.cgpa) || 0,
        active_backlogs: parseInt(formData.active_backlogs) || 0,
      })
      setFormData({
        email: '', password: '', full_name: '', roll_number: '',
        department_id: '', graduation_year: '', cgpa: '', active_backlogs: '',
        phone: '', skills: '',
      })
      setShowForm(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function departmentName(id) {
    const dept = departments.find((d) => d.id === id)
    return dept ? dept.code : id
  }

  function skillTags(skills) {
    if (!skills) return <span className="muted-text">—</span>
    const list = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim())
    return list.map((s, i) => (
      <span key={i} className="tag">{s}</span>
    ))
  }

  return (
    <div className="app-layout">
      <Nav role="admin" title="Admin" />
      <main className="main-content">
        <div className="page-header-row">
          <div>
            <h1>Students</h1>
            <p className="page-subtitle">Search, add, and manage student records.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>

        {showForm && (
          <form className="panel-form" onSubmit={handleAddStudent}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="e.g. Priya Sharma" required />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input name="roll_number" value={formData.roll_number} onChange={handleChange} placeholder="e.g. 21CS045" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 8 characters" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select name="department_id" value={formData.department_id} onChange={handleChange} required>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="e.g. 2026" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CGPA</label>
                <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.5" />
              </div>
              <div className="form-group">
                <label>Active Backlogs</label>
                <input type="number" name="active_backlogs" value={formData.active_backlogs} onChange={handleChange} placeholder="e.g. 0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Skills</label>
                <input name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. python, sql" />
              </div>
            </div>
            {formError && <p className="error-message">{formError}</p>}
            <button type="submit" className="btn-success" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        )}

        <form className="filter-bar" onSubmit={handleSearch}>
          <div className="filter-group">
            <label>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Graduation Year</label>
            <input type="number" placeholder="e.g. 2026" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {searched && !loading && !error && students.length === 0 && (
          <div className="empty-state">No students found for the selected filters.</div>
        )}

        {students.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No.</th><th>Name</th><th>Department</th><th>Grad Year</th>
                  <th>CGPA</th><th>Backlogs</th><th>Skills</th><th>Phone</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.roll_number}</td>
                    <td className="cell-strong">{s.full_name}</td>
                    <td>{departmentName(s.department_id)}</td>
                    <td>{s.graduation_year}</td>
                    <td>{s.cgpa}</td>
                    <td>
                      <span className={`badge ${s.active_backlogs > 0 ? 'badge-amber' : 'badge-green'}`}>
                        {s.active_backlogs}
                      </span>
                    </td>
                    <td className="tags-cell">{skillTags(s.skills)}</td>
                    <td>{s.phone || '—'}</td>
                    <td>
                      <button className="btn-danger-sm" onClick={() => handleDelete(s.id)}>Delete</button>
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

export default AdminStudents