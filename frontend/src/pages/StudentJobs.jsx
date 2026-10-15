import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './StudentJobs.css'

const TABS = [
  { key: 'eligible', label: 'Eligible Jobs' },
  { key: 'applications', label: 'My Applications' },
  { key: 'interviews', label: 'Interviews' },
]
const STAGES = ['applied', 'shortlisted', 'interview_scheduled', 'selected']
const STAGE_LABELS = { applied: 'Applied', shortlisted: 'Shortlisted', interview_scheduled: 'Interview', selected: 'Selected' }

function skillList(skills) {
  if (!skills) return []
  return Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean)
}

function statusClass(status) {
  if (status === 'selected') return 'sj-green'
  if (status === 'rejected') return 'sj-red'
  if (status === 'shortlisted') return 'sj-amber'
  if (status === 'interview_scheduled') return 'sj-teal'
  return 'sj-blue'
}

// Interview time is shown exactly as the company entered it.
function formatWhen(value) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function StudentJobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const tab = TABS.some((t) => t.key === requested) ? requested : 'eligible'

  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applyingId, setApplyingId] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/students/me/jobs/eligible'),
      api.get('/api/students/me/applications'),
      api.get('/api/students/me/interviews'),
    ])
      .then(([jobsRes, appsRes, ivRes]) => {
        setJobs(jobsRes.data)
        setApplications(appsRes.data)
        setInterviews(ivRes.data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function hasApplied(jobId) {
    return applications.some((a) => a.job_id === jobId)
  }

  async function handleApply(jobId) {
    setApplyingId(jobId)
    setError('')
    try {
      await api.post(`/api/students/me/jobs/${jobId}/apply`)
      const res = await api.get('/api/students/me/applications')
      setApplications(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setApplyingId(null)
    }
  }

  const upcoming = interviews
    .filter((i) => i.result === 'pending')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  const completed = interviews.filter((i) => i.result !== 'pending')

  const counts = { eligible: jobs.length, applications: applications.length, interviews: interviews.length }

  function InterviewCard({ iv }) {
    return (
      <div className="sj-card">
        <div className="sj-card-top">
          <div>
            <h4>{iv.job_title}</h4>
            <p className="sj-company">{iv.company_name}</p>
          </div>
          <span className="sj-badge sj-teal">{iv.mode}</span>
        </div>
        <p className="sj-when">🗓 {formatWhen(iv.scheduled_at)}</p>
        {iv.location_or_link &&
          (iv.location_or_link.startsWith('http') ? (
            <a href={iv.location_or_link} target="_blank" rel="noreferrer" className="sj-link">Join / open link →</a>
          ) : (
            <p className="sj-muted">📍 {iv.location_or_link}</p>
          ))}
        {iv.notes && <p className="sj-notes">{iv.notes}</p>}
        {iv.result !== 'pending' && (
          <span className={`sj-badge ${iv.result === 'passed' ? 'sj-green' : 'sj-red'}`}>{iv.result}</span>
        )}
      </div>
    )
  }

  return (
    <div className="sj-shell">
      <Nav role="student" title="Student" />
      <main className="sj-main">
        <div className="sj-header">
          <h1>Jobs</h1>
          <p className="sj-subtitle">Find jobs you are eligible for and track every application.</p>
        </div>

        <div className="sj-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`sj-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setSearchParams({ tab: t.key })}
            >
              {t.label} <span className="sj-tab-count">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {error && <p className="sj-error">{error}</p>}

        {loading ? (
          <div className="sj-empty">Loading...</div>
        ) : (
          <>
            {tab === 'eligible' &&
              (jobs.length === 0 ? (
                <div className="sj-empty">No eligible jobs right now. Jobs matching your CGPA, department, skills and year appear here.</div>
              ) : (
                <div className="sj-list">
                  {jobs.map((job) => (
                    <div key={job.id} className="sj-card">
                      <div className="sj-card-top">
                        <div>
                          <h4>{job.title}</h4>
                          <p className="sj-company">{job.company_name}</p>
                        </div>
                        <div className="sj-badges">
                          <span className="sj-badge sj-blue">CGPA ≥ {job.min_cgpa}</span>
                          {job.min_year && <span className="sj-badge sj-teal">Year ≥ {job.min_year}</span>}
                        </div>
                      </div>
                      {job.description && <p className="sj-desc">{job.description}</p>}
                      {skillList(job.required_skills).length > 0 && (
                        <div className="sj-tags">
                          {skillList(job.required_skills).map((s, i) => <span key={i} className="sj-tag">{s}</span>)}
                        </div>
                      )}
                      <div className="sj-footer">
                        {hasApplied(job.id) ? (
                          <span className="sj-badge sj-green">✓ Applied</span>
                        ) : (
                          <button className="sj-btn-primary" onClick={() => handleApply(job.id)} disabled={applyingId === job.id}>
                            {applyingId === job.id ? 'Applying...' : 'Apply'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {tab === 'applications' &&
              (applications.length === 0 ? (
                <div className="sj-empty">No applications yet. Apply from the Eligible Jobs tab.</div>
              ) : (
                <div className="sj-list">
                  {applications.map((app) => {
                    const stageIndex = STAGES.indexOf(app.status)
                    return (
                      <div key={app.application_id} className="sj-card">
                        <div className="sj-card-top">
                          <div>
                            <h4>{app.job_title}</h4>
                            <p className="sj-company">{app.company_name}</p>
                          </div>
                          <div className="sj-right">
                            <span className={`sj-badge ${statusClass(app.status)}`}>{app.status.replace('_', ' ')}</span>
                            <span className="sj-muted">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="sj-stepper">
                          {STAGES.map((s, i) => (
                            <div
                              key={s}
                              className={`sj-step ${app.status === 'rejected' ? (i === 0 ? 'on' : 'bad') : i <= stageIndex ? 'on' : ''}`}
                            >
                              {STAGE_LABELS[s]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

            {tab === 'interviews' &&
              (interviews.length === 0 ? (
                <div className="sj-empty">No interviews scheduled yet.</div>
              ) : (
                <>
                  <h3 className="sj-group-title">Upcoming ({upcoming.length})</h3>
                  {upcoming.length === 0 ? (
                    <div className="sj-empty sj-empty-small">No upcoming interviews.</div>
                  ) : (
                    <div className="sj-list">
                      {upcoming.map((iv) => <InterviewCard key={iv.id} iv={iv} />)}
                    </div>
                  )}

                  {completed.length > 0 && (
                    <>
                      <h3 className="sj-group-title">Completed ({completed.length})</h3>
                      <div className="sj-list">
                        {completed.map((iv) => <InterviewCard key={iv.id} iv={iv} />)}
                      </div>
                    </>
                  )}
                </>
              ))}
          </>
        )}
      </main>
    </div>
  )
}

export default StudentJobs