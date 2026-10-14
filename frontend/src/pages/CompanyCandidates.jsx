import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './CompanyCandidates.css'

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview_scheduled', label: 'Interview' },
  { key: 'selected', label: 'Selected' },
  { key: 'rejected', label: 'Rejected' },
]

function statusClass(status) {
  if (status === 'selected') return 'cc-green'
  if (status === 'rejected') return 'cc-red'
  if (status === 'shortlisted') return 'cc-amber'
  if (status === 'interview_scheduled') return 'cc-teal'
  return 'cc-blue'
}

const EMPTY_SCHEDULE = { scheduled_at: '', mode: 'online', location_or_link: '', notes: '' }

function CompanyCandidates() {
  const [searchParams, setSearchParams] = useSearchParams()
  const jobFilter = searchParams.get('job') || ''
  const [statusFilter, setStatusFilter] = useState('all')

  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [scheduleApp, setScheduleApp] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE)
  const [scheduleError, setScheduleError] = useState('')
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    loadCandidates()
    api.get('/api/companies/jobs').then((res) => setJobs(res.data)).catch(() => setJobs([]))
    api.get('/api/companies/departments').then((res) => setDepartments(res.data)).catch(() => setDepartments([]))
  }, [])

  async function loadCandidates(silent = false) {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/api/companies/applicants')
      setCandidates(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function departmentCode(id) {
    const dept = departments.find((d) => d.id === id)
    return dept ? dept.code : id
  }

  async function changeStatus(applicationId, status) {
    setBusyId(applicationId)
    setError('')
    try {
      await api.put(`/api/companies/applications/${applicationId}/status`, { status })
      await loadCandidates(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function recordResult(interviewId, result, applicationId) {
    setBusyId(applicationId)
    setError('')
    try {
      await api.put(`/api/companies/interviews/${interviewId}`, { result })
      await loadCandidates(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  function openSchedule(applicationId) {
    setScheduleApp(applicationId)
    setScheduleForm(EMPTY_SCHEDULE)
    setScheduleError('')
  }

  function handleScheduleChange(e) {
    setScheduleForm({ ...scheduleForm, [e.target.name]: e.target.value })
  }

  async function submitSchedule(e) {
    e.preventDefault()
    setScheduleError('')
    setScheduling(true)
    try {
      await api.post(`/api/companies/applications/${scheduleApp}/interview`, scheduleForm)
      setScheduleApp(null)
      await loadCandidates(true)
    } catch (err) {
      setScheduleError(err.message)
    } finally {
      setScheduling(false)
    }
  }

  const jobFiltered = jobFilter ? candidates.filter((c) => String(c.job_id) === jobFilter) : candidates
  const visible = statusFilter === 'all' ? jobFiltered : jobFiltered.filter((c) => c.status === statusFilter)
  const countFor = (key) => (key === 'all' ? jobFiltered.length : jobFiltered.filter((c) => c.status === key).length)

  return (
    <div className="cc-shell">
      <Nav role="company" title="Company" />
      <main className="cc-main">
        <div className="cc-header">
          <div>
            <h1>Candidates</h1>
            <p className="cc-subtitle">Students who applied to your jobs.</p>
          </div>
          <div className="cc-select-wrap">
            <label>Job</label>
            <select value={jobFilter} onChange={(e) => setSearchParams(e.target.value ? { job: e.target.value } : {})}>
              <option value="">All jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cc-tabs">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              className={`cc-tab ${statusFilter === t.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label} <span className="cc-tab-count">{countFor(t.key)}</span>
            </button>
          ))}
        </div>

        {error && <p className="cc-error">{error}</p>}

        {loading ? (
          <div className="cc-empty">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="cc-empty">No candidates found.</div>
        ) : (
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Dept · CGPA</th>
                  <th>Status</th>
                  <th>Interview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const busy = busyId === c.application_id
                  return (
                    <tr key={c.application_id}>
                      <td>
                        <span className="cc-name">{c.full_name}</span>
                        <span className="cc-muted">{c.roll_number}</span>
                        <span className="cc-muted">{c.email}</span>
                      </td>
                      <td>{c.job_title}</td>
                      <td>
                        {departmentCode(c.department_id)} · {c.cgpa}
                      </td>
                      <td>
                        <span className={`cc-badge ${statusClass(c.status)}`}>{c.status.replace('_', ' ')}</span>
                      </td>
                      <td>
                        {c.interview_scheduled_at ? (
                          <div className="cc-interview">
                            <span className="cc-when">{new Date(c.interview_scheduled_at).toLocaleString()}</span>
                            <span className="cc-muted">{c.interview_mode}</span>
                            {c.interview_location_or_link &&
                              (c.interview_location_or_link.startsWith('http') ? (
                                <a href={c.interview_location_or_link} target="_blank" rel="noreferrer" className="cc-link">
                                  Open link
                                </a>
                              ) : (
                                <span className="cc-muted">{c.interview_location_or_link}</span>
                              ))}
                            {c.interview_result && c.interview_result !== 'pending' && (
                              <span className={`cc-badge ${c.interview_result === 'passed' ? 'cc-green' : 'cc-red'}`}>
                                {c.interview_result}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="cc-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="cc-actions">
                          {c.status === 'applied' && (
                            <>
                              <button className="cc-act cc-act-amber" disabled={busy} onClick={() => changeStatus(c.application_id, 'shortlisted')}>Shortlist</button>
                              <button className="cc-act cc-act-red" disabled={busy} onClick={() => changeStatus(c.application_id, 'rejected')}>Reject</button>
                            </>
                          )}
                          {c.status === 'shortlisted' && (
                            <>
                              <button className="cc-act cc-act-teal" disabled={busy} onClick={() => openSchedule(c.application_id)}>Schedule Interview</button>
                              <button className="cc-act cc-act-green" disabled={busy} onClick={() => changeStatus(c.application_id, 'selected')}>Select</button>
                              <button className="cc-act cc-act-red" disabled={busy} onClick={() => changeStatus(c.application_id, 'rejected')}>Reject</button>
                            </>
                          )}
                          {c.status === 'interview_scheduled' && c.interview_id && (
                            <>
                              <button className="cc-act cc-act-green" disabled={busy} onClick={() => recordResult(c.interview_id, 'passed', c.application_id)}>Mark Passed</button>
                              <button className="cc-act cc-act-red" disabled={busy} onClick={() => recordResult(c.interview_id, 'failed', c.application_id)}>Mark Failed</button>
                            </>
                          )}
                          {c.status === 'interview_scheduled' && !c.interview_id && (
                            <>
                              <button className="cc-act cc-act-green" disabled={busy} onClick={() => changeStatus(c.application_id, 'selected')}>Select</button>
                              <button className="cc-act cc-act-red" disabled={busy} onClick={() => changeStatus(c.application_id, 'rejected')}>Reject</button>
                            </>
                          )}
                          {(c.status === 'selected' || c.status === 'rejected') && <span className="cc-muted">—</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {scheduleApp && (
          <div className="cc-overlay" onClick={() => setScheduleApp(null)}>
            <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cc-modal-header">
                <h3>Schedule Interview</h3>
                <button className="cc-modal-close" onClick={() => setScheduleApp(null)}>×</button>
              </div>

              <form className="cc-form" onSubmit={submitSchedule}>
                <div className="cc-group">
                  <label>Date &amp; Time</label>
                  <input type="datetime-local" name="scheduled_at" value={scheduleForm.scheduled_at} onChange={handleScheduleChange} required />
                </div>
                <div className="cc-group">
                  <label>Mode</label>
                  <select name="mode" value={scheduleForm.mode} onChange={handleScheduleChange}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div className="cc-group">
                  <label>{scheduleForm.mode === 'online' ? 'Meeting Link' : 'Venue'}</label>
                  <input
                    name="location_or_link"
                    value={scheduleForm.location_or_link}
                    onChange={handleScheduleChange}
                    placeholder={scheduleForm.mode === 'online' ? 'https://meet.google.com/...' : 'e.g. Room 302'}
                  />
                </div>
                <div className="cc-group">
                  <label>Notes (optional)</label>
                  <textarea name="notes" value={scheduleForm.notes} onChange={handleScheduleChange} placeholder="Any instructions" rows={2} />
                </div>

                {scheduleError && <p className="cc-error">{scheduleError}</p>}

                <div className="cc-modal-actions">
                  <button type="button" className="cc-btn-ghost" onClick={() => setScheduleApp(null)}>Cancel</button>
                  <button type="submit" className="cc-btn-success" disabled={scheduling}>
                    {scheduling ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CompanyCandidates