import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './StudentDashboard.css'

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

  function statusBadgeClass(status) {
    if (status === 'selected') return 'status-selected'
    if (status === 'rejected') return 'status-rejected'
    if (status === 'shortlisted') return 'status-shortlisted'
    if (status === 'interview_scheduled') return 'status-interview'
    return 'status-applied'
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

  return (
    <div>
      <Nav title="Student Dashboard" />
      <div className="student-page">
        {error && <p className="student-error">{error}</p>}

        <div className="student-grid">
          <div className="profile-card">
            <h3>My Profile</h3>
            {loadingProfile ? (
              <p className="loading-text">Loading...</p>
            ) : profile && !editMode ? (
              <div className="profile-details">
                <div className="profile-row">
                  <span className="profile-label">Name</span>
                  <span>{profile.full_name}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Roll No.</span>
                  <span>{profile.roll_number}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">CGPA</span>
                  <span>{profile.cgpa}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Backlogs</span>
                  <span>{profile.active_backlogs}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Skills</span>
                  <span>{profile.skills || '—'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Phone</span>
                  <span>{profile.phone || '—'}</span>
                </div>

                <button className="edit-profile-button" onClick={startEdit}>
                  Edit Profile
                </button>

                <div className="resume-section">
                  <span className="profile-label">Resume</span>
                  {profile.resume_filename ? (
                    <p className="resume-current">📄 {profile.resume_filename}</p>
                  ) : (
                    <p className="resume-none">No resume uploaded yet</p>
                  )}

                  <form onSubmit={handleResumeUpload} className="resume-form">
                    <input
                      type="file"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      accept=".pdf,.doc,.docx"
                    />
                    <button type="submit" disabled={!resumeFile || uploading}>
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </form>
                  {uploadError && <p className="student-error">{uploadError}</p>}
                </div>
              </div>
            ) : profile && editMode ? (
              <form className="edit-profile-form" onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="full_name" value={editData.full_name} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Graduation Year</label>
                  <input
                    type="number"
                    name="graduation_year"
                    value={editData.graduation_year}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>CGPA</label>
                  <input type="number" step="0.01" name="cgpa" value={editData.cgpa} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Active Backlogs</label>
                  <input
                    type="number"
                    name="active_backlogs"
                    value={editData.active_backlogs}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={editData.phone} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Skills</label>
                  <input
                    name="skills"
                    value={editData.skills}
                    onChange={handleEditChange}
                    placeholder="e.g. python, sql"
                  />
                </div>

                {editError && <p className="student-error">{editError}</p>}

                <div className="edit-actions">
                  <button type="submit" className="save-edit-button" disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="cancel-edit-button" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          <div className="jobs-card">
            <h3>Jobs You're Eligible For</h3>
            {loadingJobs ? (
              <p className="loading-text">Loading...</p>
            ) : jobs.length === 0 ? (
              <p className="jobs-empty">No eligible jobs right now — check back later.</p>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-item">
                    <div className="job-item-header">
                      <div>
                        <h4>{job.title}</h4>
                        <p className="job-company-name">{job.company_name}</p>
                      </div>
                      <span className="job-cgpa-badge">CGPA ≥ {job.min_cgpa}</span>
                    </div>
                    {job.description && <p className="job-description">{job.description}</p>}
                    {job.required_skills && (
                      <p className="job-skills">
                        <strong>Skills:</strong> {job.required_skills}
                      </p>
                    )}
                    <div className="job-item-footer">
                      {hasApplied(job.id) ? (
                        <span className="applied-badge">✓ Applied</span>
                      ) : (
                        <button
                          className="apply-button"
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
        </div>

        <div className="secondary-grid">
          <div className="applications-card">
            <h3>My Applications</h3>
            {myApplications.length === 0 ? (
              <p className="jobs-empty">You haven't applied to any jobs yet.</p>
            ) : (
              <div className="my-applications-list">
                {myApplications.map((app) => (
                  <div key={app.application_id} className="my-application-item">
                    <div>
                      <p className="ma-job-title">{app.job_title}</p>
                      <p className="ma-company-name">{app.company_name}</p>
                    </div>
                    <span className={`applicant-status-badge ${statusBadgeClass(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="applications-card">
            <h3>Upcoming Interviews</h3>
            {loadingInterviews ? (
              <p className="loading-text">Loading...</p>
            ) : myInterviews.length === 0 ? (
              <p className="jobs-empty">No interviews scheduled yet.</p>
            ) : (
              <div className="my-applications-list">
                {myInterviews.map((iv) => (
                  <div key={iv.id} className="interview-item">
                    <div className="interview-item-header">
                      <p className="ma-job-title">{iv.job_title}</p>
                      <span className={`applicant-status-badge ${statusBadgeClass('interview_scheduled')}`}>
                        {iv.mode}
                      </span>
                    </div>
                    <p className="ma-company-name">{iv.company_name}</p>
                    <p className="interview-when">
                      🗓 {new Date(iv.scheduled_at).toLocaleString()}
                    </p>
                    {iv.location_or_link && (
                      <p className="interview-where">{iv.location_or_link}</p>
                    )}
                    {iv.notes && <p className="interview-notes">{iv.notes}</p>}
                    {iv.result !== 'pending' && (
                      <span className={`applicant-status-badge ${iv.result === 'passed' ? 'status-selected' : 'status-rejected'}`}>
                        {iv.result}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard