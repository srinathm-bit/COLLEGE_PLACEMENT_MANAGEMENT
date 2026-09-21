import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminDepartments.css'
import { Link } from 'react-router-dom'

function AdminDepartments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', code: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  function fetchDepartments() {
    setLoading(true)
    api.get('/api/admin/departments')
      .then((res) => setDepartments(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleAddDepartment(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      await api.post('/api/admin/departments', formData)
      setFormData({ name: '', code: '' })
      setShowForm(false)
      fetchDepartments()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(departmentId) {
    if (!window.confirm('Are you sure you want to delete this department?')) return

    try {
      await api.delete(`/api/admin/departments/${departmentId}`)
      setDepartments((prev) => prev.filter((d) => d.id !== departmentId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <Nav title="Admin Dashboard" />
      <div className="departments-page">
        <div className="departments-header">
        <Link to="/admin-dashboard" className="back-link">← Back to Dashboard</Link>
          <div>
            <h2>Departments</h2>
            <p className="departments-subtitle">Manage academic departments.</p>
          </div>
          <button className="add-department-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Department'}
          </button>
        </div>

        {showForm && (
          <form className="add-department-form" onSubmit={handleAddDepartment}>
            <div className="form-row">
              <div className="form-group">
                <label>Department Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science and Engineering"
                  required
                />
              </div>
              <div className="form-group">
                <label>Department Code</label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. CSE"
                  required
                />
              </div>
            </div>

            {formError && <p className="departments-error">{formError}</p>}

            <button type="submit" className="submit-department-button" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Department'}
            </button>
          </form>
        )}

        {error && <p className="departments-error">{error}</p>}

        {loading ? (
          <p className="departments-loading">Loading departments...</p>
        ) : departments.length === 0 ? (
          <p className="departments-empty">No departments added yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="departments-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td className="dept-name-cell">{d.name}</td>
                    <td>
                      <span className="dept-code-badge">{d.code}</span>
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => handleDelete(d.id)}>
                        Delete
                      </button>
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

export default AdminDepartments