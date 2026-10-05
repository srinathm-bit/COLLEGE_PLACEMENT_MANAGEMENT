import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './StudentDashboard.css'

const STAGES = ['applied', 'shortlisted', 'interview_scheduled', 'selected']
const STAGE_LABELS = { applied: 'Applied', shortlisted: 'Shortlisted', interview_scheduled: 'Interview', selected: 'Selected' }

function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [error, setError] = useState('')

  const [resumeFile, setResumeFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [myApplications, setMyApplications] = useState([])
  const [applyingJobId, setApplyingJobId] = useState(null)

  const [myInterviews, setMyInterviews] = useState([])
  const [loadingInterviews, setLoadingInterviews] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchEligibleJobs()
    fetchMyApplications()
    fetchMyInterviews()
  }, [])

  function fetchProfile() {
    setLoadingProfile(true)
    api.get('/api/students/me')
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingProfile(false))
  }

  function fetchEligibleJobs() {
    setLoadingJobs(true)
    api.get('/api/students/me/jobs/eligible')
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingJobs(false))
  }

  function fetchMyApplications() {
    api.get('/api/students/me/applications')
      .then((res) => setMyApplications(res.data))
      .catch(() => setMyApplications([]))
  }

  function fetchMyInterviews() {
    setLoadingInterviews(true)
    api.get('/api/students/me/interviews')
      .then((res) => setMyInterviews(res.data))
      .catch(() => setMyInterviews([]))
      .finally(() => setLoadingInterviews(false))
  }

  async function handleApply(jobId) {
    setApplyingJobId(jobId)
    setError('')
    try {
      await api.post(`/api/students/me/jobs/${jobId}/apply`)
      fetchMyApplications()
    } catch (err) {
      setError(err.message)
    } finally {
      setApplyingJobId(null)
    }
  }

  function hasApplied(jobId) {
    return myApplications.some((app) => app.job_id === jobId)
  }

  function startEdit() {
    setEditData({
      full_name: profile.full_name,
      graduation_year: profile.graduation_year,
      cgpa: profile.cgpa,
      active_backlogs: profile.active_backlogs,
      phone: profile.phone || '',
      skills: profile.skills || '',
    })
    setEditError('')
    setEditMode(true)
  }

  function handleEditChange(e) {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setEditError('')
    setSavingEdit(true)

    try {
      await api.put('/api/students/me', {
        ...editData,
        graduation_year: parseInt(editData.graduation_year) || 0,
        cgpa: parseFloat(editData.cgpa) || 0,
        active_backlogs: parseInt(editData.active_backlogs) || 0,
      })
      setEditMode(false)
      fetchProfile()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleResumeUpload(e) {
    e.preventDefault()
    if (!resumeFile) return

    setUploadError('')
    setUploading(true)

    const form = new FormData()
    form.append('file', resumeFile)

    try {
      await api.post('/api/students/me/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeFile(null)
      fetchProfile()
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function skillTags(skills) {
    if (!skills) return <span className="muted-text">—</span>
    const list = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim())
    return list.map((s, i) => <span key={i} className="tag tag-accent">{s}</span>)
  }

  return (
    <div className="app-layout">
      <Nav role="student" title="Student" />
      <main className="main-content">
        <div className="page-header-row">
          <div>
            <h1>Welcome back, {profile?.full_name?.split(' ')[0] || ''}</h1>
            <p className="page-subtitle">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} match your profile right now.
            </p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="dashboard-grid">
          <div className="side-panel">
            <div className="panel-card">
              <h3>My Profile</h3>
              {loadingProfile ? (
                <p className="muted-text">Loading...</p>
              ) : profile && !editMode ? (
                <div className="profile-list">
                  <div className="profile-row"><span className="profile-label">Name</span><span>{profile.full_name}</span></div>
                  <div className="profile-row"><span className="profile-label">Roll No.</span><span>{profile.roll_number}</span></div>
                  <div className="profile-row"><span className="profile-label">CGPA</span><span>{profile.cgpa}</span></div>
                  <div className="profile-row"><span className="profile-label">Backlogs</span><span>{profile.active_backlogs}</span></div>
                  <div className="profile-row"><span className="profile-label">Phone</span><span>{profile.phone || '—'}</span></div>
                  <div className="profile-row-skills">
                    <span className="profile-label">Skills</span>
                    <div>{skillTags(profile.skills)}</div>
                  </div>

                  <button className="btn-outline" onClick={startEdit}>Edit Profile</button>

                  <div className="resume-section">
                    <span className="profile-label">Resume</span>
                    {profile.resume_filename ? (
                      <p className="resume-current">📄 {profile.resume_filename}</p>
                    ) : (
                      <p className="muted-text">No resume uploaded yet</p>
                    )}
                    <form onSubmit={handleResumeUpload} className="resume-form">
                      <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
                      <button type="submit" className="btn-primary btn-sm" disabled={!resumeFile || uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </form>
                    {uploadError && <p className="error-message">{uploadError}</p>}
                  </div>
                </div>
              ) : profile && editMode ? (
                <form className="edit-form" onSubmit={handleSaveEdit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="full_name" value={editData.full_name} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Graduation Year</label>
                    <input type="number" name="graduation_year" value={editData.graduation_year} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>CGPA</label>
                    <input type="number" step="0.01" name="cgpa" value={editData.cgpa} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Active Backlogs</label>
                    <input type="number" name="active_backlogs" value={editData.active_backlogs} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={editData.phone} onChange={handleEditChange} />
                  </div>
                  <div className="form-group">
                    <label>Skills</label>
                    <input name="skills" value={editData.skills} onChange={handleEditChange} placeholder="e.g. python, sql" />
                  </div>
                  {editError && <p className="error-message">{editError}</p>}
                  <div className="edit-actions">
                    <button type="submit" className="btn-success" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</button>
                    <button type="button" className="btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>

          <div className="main-panel">
            <div className="panel-card">
              <h3>Jobs You're Eligible For</h3>
              {loadingJobs ? (
                <p className="muted-text">Loading...</p>
              ) : jobs.length === 0 ? (
                <div className="empty-state">No eligible jobs right now — check back later.</div>
              ) : (
                <div className="job-list">
                  {jobs.map((job) => (
                    <div key={job.id} className="job-item">
                      <div className="job-item-top">
                        <div>
                          <h4>{job.title}</h4>
                          <p className="job-company">{job.company_name}</p>
                        </div>
                        <span className="badge badge-blue">CGPA ≥ {job.min_cgpa}</span>
                      </div>
                      {job.description && <p className="job-desc">{job.description}</p>}
                      {job.required_skills && <div className="job-tags">{skillTags(job.required_skills)}</div>}
                      <div className="job-item-footer">
                        {hasApplied(job.id) ? (
                          <span className="badge badge-green">✓ Applied</span>
                        ) : (
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleApply(job.id)}
                            disabled={applyingJobId === job.id}
                          >
                            {applyingJobId === job.id ? 'Applying...' : 'Apply'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel-card">
              <h3>My Applications</h3>
              {myApplications.length === 0 ? (
                <div className="empty-state">No applications yet. Apply from the eligible jobs above.</div>
              ) : (
                <div className="app-list">
                  {myApplications.map((app) => {
                    const stageIndex = STAGES.indexOf(app.status)
                    return (
                      <div key={app.application_id} className="app-item">
                        <div className="app-item-top">
                          <div>
                            <h4>{app.job_title}</h4>
                            <p className="job-company">{app.company_name}</p>
                          </div>
                          <span className={`badge ${app.status === 'rejected' ? 'badge-red' : app.status === 'selected' ? 'badge-green' : 'badge-amber'}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="stepper">
                          {STAGES.map((s, i) => (
                            <div
                              key={s}
                              className={`step ${app.status === 'rejected' ? (i === 0 ? 'on' : 'bad') : i <= stageIndex ? 'on' : ''}`}
                            >
                              {STAGE_LABELS[s]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="panel-card">
              <h3>Upcoming Interviews</h3>
              {loadingInterviews ? (
                <p className="muted-text">Loading...</p>
              ) : myInterviews.length === 0 ? (
                <div className="empty-state">No interviews scheduled yet.</div>
              ) : (
                <div className="app-list">
                  {myInterviews.map((iv) => (
                    <div key={iv.id} className="app-item">
                      <div className="app-item-top">
                        <div>
                          <h4>{iv.job_title}</h4>
                          <p className="job-company">{iv.company_name}</p>
                        </div>
                        <span className="badge badge-teal">{iv.mode}</span>
                      </div>
                      <p className="interview-when">🗓 {new Date(iv.scheduled_at).toLocaleString()}</p>
                      {iv.location_or_link && <p className="muted-text">{iv.location_or_link}</p>}
                      {iv.notes && <p className="interview-notes">{iv.notes}</p>}
                      {iv.result !== 'pending' && (
                        <span className={`badge ${iv.result === 'passed' ? 'badge-green' : 'badge-red'}`}>{iv.result}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard