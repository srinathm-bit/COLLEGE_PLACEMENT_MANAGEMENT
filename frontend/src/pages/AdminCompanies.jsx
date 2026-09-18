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
    email: '',
    password: '',
    company_name: '',
    industry: '',
    website: '',
    contact_person: '',
    contact_phone: '',
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
        email: '',
        password: '',
        company_name: '',
        industry: '',
        website: '',
        contact_person: '',
        contact_phone: '',
      })
      setShowForm(false)
      fetchCompanies()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Nav title="Admin Dashboard" />
      <div className="companies-page">
        <div className="companies-header">
          <div>
            <h2>Companies</h2>
            <p className="companies-subtitle">Registered companies on the platform.</p>
          </div>
          <button className="add-company-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Company'}
          </button>
        </div>

        {showForm && (
          <form className="add-company-form" onSubmit={handleAddCompany}>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hr@acmecorp.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Information Technology"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Website</label>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://acmecorp.com"
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="e.g. Jane Smith"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            {formError && <p className="companies-error">{formError}</p>}

            <button type="submit" className="submit-company-button" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Company'}
            </button>
          </form>
        )}

        {error && <p className="companies-error">{error}</p>}

        {loading ? (
          <p className="companies-loading">Loading companies...</p>
        ) : companies.length === 0 ? (
          <p className="companies-empty">No companies registered yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Phone</th>
                  <th>Website</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td className="company-name-cell">{c.company_name}</td>
                    <td>{c.industry || '—'}</td>
                    <td>{c.email}</td>
                    <td>{c.contact_person || '—'}</td>
                    <td>{c.contact_phone || '—'}</td>
                    <td>
                      {c.website ? (
                        <a href={c.website} target="_blank" rel="noreferrer" className="website-link">
                          Visit
                        </a>
                      ) : '—'}
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

export default AdminCompanies