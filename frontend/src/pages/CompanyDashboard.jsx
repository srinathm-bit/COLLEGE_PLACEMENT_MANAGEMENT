import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './CompanyDashboard.css'

function CompanyDashboard() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/api/companies/me'), api.get('/api/companies/me/stats')])
      .then(([profileRes, statsRes]) => {
        setProfile(profileRes.data)
        setStats(statsRes.data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const kpis = stats
    ? [
        { label: 'Total Jobs', value: stats.total_jobs, tone: 'blue' },
        { label: 'Applicants', value: stats.total_applicants, tone: 'plain' },
        { label: 'Shortlisted', value: stats.shortlisted, tone: 'amber' },
        { label: 'Selected', value: stats.selected, tone: 'green' },
        { label: 'Placed Students', value: stats.placed, tone: 'teal' },
      ]
    : []

  return (
    <div className="cd-shell">
      <Nav role="company" title="Company" />
      <main className="cd-main">
        <div className="cd-header">
          <h1>{profile ? `Welcome, ${profile.company_name}` : 'Dashboard'}</h1>
          <p className="cd-subtitle">Your placement activity at a glance.</p>
        </div>

        {error && <p className="cd-error">{error}</p>}

        {loading ? (
          <div className="cd-loading">Loading...</div>
        ) : (
          <>
            <div className="cd-kpi-grid">
              {kpis.map((k) => (
                <div key={k.label} className={`cd-kpi cd-tone-${k.tone}`}>
                  <span className="cd-kpi-value">{k.value}</span>
                  <span className="cd-kpi-label">{k.label}</span>
                </div>
              ))}
            </div>

            {profile && (
              <div className="cd-profile">
                <div className="cd-profile-top">
                  <div className="cd-avatar">{profile.company_name?.charAt(0)}</div>
                  <div>
                    <p className="cd-profile-name">{profile.company_name}</p>
                    <p className="cd-profile-industry">{profile.industry || 'Industry not set'}</p>
                  </div>
                </div>
                <div className="cd-info-grid">
                  <div className="cd-info-item">
                    <span className="cd-info-label">Email</span>
                    <span>{profile.email}</span>
                  </div>
                  <div className="cd-info-item">
                    <span className="cd-info-label">Contact Person</span>
                    <span>{profile.contact_person || '—'}</span>
                  </div>
                  <div className="cd-info-item">
                    <span className="cd-info-label">Phone</span>
                    <span>{profile.contact_phone || '—'}</span>
                  </div>
                  <div className="cd-info-item">
                    <span className="cd-info-label">Website</span>
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="cd-link">
                        {profile.website}
                      </a>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default CompanyDashboard