import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminAnnouncements.css'

const AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'students', label: 'Students only' },
  { value: 'companies', label: 'Companies only' },
]
const AUDIENCE_LABEL = { all: 'Everyone', students: 'Students', companies: 'Companies' }

// Server sends UTC without a "Z", so add it before parsing.
function formatDate(value) {
  const hasTz = /Z|[+-]\d{2}:?\d{2}$/.test(value)
  return new Date(hasTz ? value : value + 'Z').toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', message: '', audience: 'all' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  function fetchAnnouncements() {
    setLoading(true)
    api.get('/api/admin/announcements')
      .then((res) => setAnnouncements(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handlePost(e) {
    e.preventDefault()
    setFormError('')

    if (!formData.title.trim() || !formData.message.trim()) {
      setFormError('Please enter both a title and a message.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/admin/announcements', formData)
      setFormData({ title: '', message: '', audience: 'all' })
      setShowForm(false)
      fetchAnnouncements()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await api.delete(`/api/admin/announcements/${id}`)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="aa-shell">
      <Nav role="admin" title="Admin" />
      <main className="aa-main">
        <div className="aa-header">
          <div>
            <h1>Announcements</h1>
            <p className="aa-subtitle">Post notices for students and companies.</p>
          </div>
          <button className="aa-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Announcement'}
          </button>
        </div>

        {showForm && (
          <form className="aa-form" onSubmit={handlePost}>
            <div className="aa-row">
              <div className="aa-group aa-grow">
                <label>Title</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Placement drive on Oct 15" maxLength={200} required />
              </div>
              <div className="aa-group">
                <label>Audience</label>
                <select name="audience" value={formData.audience} onChange={handleChange}>
                  {AUDIENCES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="aa-group">
              <label>Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Write the announcement..." rows={4} required />
            </div>
            {formError && <p className="aa-error">{formError}</p>}
            <button type="submit" className="aa-btn-success" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        )}

        {error && <p className="aa-error">{error}</p>}

        {loading ? (
          <div className="aa-empty">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="aa-empty">No announcements yet.</div>
        ) : (
          <div className="aa-list">
            {announcements.map((a) => (
              <div key={a.id} className="aa-card">
                <div className="aa-card-top">
                  <div>
                    <h4>{a.title}</h4>
                    <div className="aa-meta">
                      <span className={`aa-badge aa-${a.audience}`}>{AUDIENCE_LABEL[a.audience] || a.audience}</span>
                      <span className="aa-date">{formatDate(a.created_at)}</span>
                    </div>
                  </div>
                  <button className="aa-btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                </div>
                <p className="aa-message">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminAnnouncements