import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminCompanies.css'

function AdminCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '', password: '', company_name: '', industry: '',
    website: '', contact_person: '', contact_phone: '',
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  function fetchCompanies() {
    setLoading(true)
    api.get('/api/admin/companies')
      .then((res) => setCompanies(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleAddCompany(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      await api.post('/api/admin/companies', formData)
      setFormData({
        email: '', password: '', company_name: '', industry: '',
        website: '', contact_person: '', contact_phone: '',
      })
      setShowForm(false)
      fetchCompanies()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(companyId) {
    if (!window.confirm('Are you sure you want to delete this company?')) return
    try {
      await api.delete(`/api/admin/companies/${companyId}`)
      setCompanies((prev) => prev.filter((c) => c.id !== companyId))
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
            <h1>Companies</h1>
            <p className="page-subtitle">Registered companies on the platform.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Company'}
          </button>
        </div>

        {showForm && (
          <form className="panel-form" onSubmit={handleAddCompany}>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. Acme Corp" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hr@acmecorp.com" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 8 characters" required />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. Information Technology" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Website</label>
                <input name="website" value={formData.website} onChange={handleChange} placeholder="https://acmecorp.com" />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="e.g. Jane Smith" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Phone</label>
                <input name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" />
              </div>
            </div>
            {formError && <p className="error-message">{formError}</p>}
            <button type="submit" className="btn-success" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Company'}
            </button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <div className="empty-state">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="empty-state">No companies registered yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th><th>Industry</th><th>Email</th>
                  <th>Contact</th><th>Phone</th><th>Website</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-strong">{c.company_name}</td>
                    <td>{c.industry || '—'}</td>
                    <td>{c.email}</td>
                    <td>{c.contact_person || '—'}</td>
                    <td>{c.contact_phone || '—'}</td>
                    <td>
                      {c.website ? (
                        <a href={c.website} target="_blank" rel="noreferrer" className="link-accent">Visit</a>
                      ) : '—'}
                    </td>
                    <td>
                      <button className="btn-danger-sm" onClick={() => handleDelete(c.id)}>Delete</button>
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

export default AdminCompanies