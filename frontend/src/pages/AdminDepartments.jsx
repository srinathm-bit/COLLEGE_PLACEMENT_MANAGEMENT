import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminDepartments.css'

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
    <div className="app-layout">
      <Nav role="admin" title="Admin" />
      <main className="main-content">
        <div className="page-header-row">
          <div>
            <h1>Departments</h1>
            <p className="page-subtitle">Manage academic departments.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Department'}
          </button>
        </div>

        {showForm && (
          <form className="panel-form" onSubmit={handleAddDepartment}>
            <div className="form-row">
              <div className="form-group">
                <label>Department Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Computer Science and Engineering" required />
              </div>
              <div className="form-group">
                <label>Department Code</label>
                <input name="code" value={formData.code} onChange={handleChange} placeholder="e.g. CSE" required />
              </div>
            </div>
            {formError && <p className="error-message">{formError}</p>}
            <button type="submit" className="btn-success" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Department'}
            </button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <div className="empty-state">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="empty-state">No departments added yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table fixed-cols">
              <thead>
                <tr><th>Name</th><th>Code</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td className="cell-strong">{d.name}</td>
                    <td><span className="badge badge-blue">{d.code}</span></td>
                    <td>
                      <button className="btn-danger-sm" onClick={() => handleDelete(d.id)}>Delete</button>
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

export default AdminDepartments