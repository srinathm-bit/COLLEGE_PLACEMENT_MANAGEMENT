import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './Announcements.css'

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000

function toDate(value) {
  const hasTz = /Z|[+-]\d{2}:?\d{2}$/.test(value)
  return new Date(hasTz ? value : value + 'Z')
}

function Announcements({ role, endpoint }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(endpoint)
      .then((res) => setAnnouncements(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [endpoint])

  return (
    <div className="ar-shell">
      <Nav role={role} title={role === 'student' ? 'Student' : 'Company'} />
      <main className="ar-main">
        <div className="ar-header">
          <h1>Announcements</h1>
          <p className="ar-subtitle">Latest notices from the placement cell.</p>
        </div>

        {error && <p className="ar-error">{error}</p>}

        {loading ? (
          <div className="ar-empty">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="ar-empty">No announcements right now.</div>
        ) : (
          <div className="ar-list">
            {announcements.map((a) => {
              const date = toDate(a.created_at)
              const isNew = Date.now() - date.getTime() < THREE_DAYS
              return (
                <div key={a.id} className="ar-card">
                  <div className="ar-card-top">
                    <h4>{a.title}</h4>
                    {isNew && <span className="ar-new">New</span>}
                  </div>
                  <span className="ar-date">
                    {date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <p className="ar-message">{a.message}</p>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Announcements