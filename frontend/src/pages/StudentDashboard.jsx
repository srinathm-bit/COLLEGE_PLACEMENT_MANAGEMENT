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

  useEffect(() => {
    fetchProfile()
    fetchEligibleJobs()
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
            ) : profile ? (
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
                      <h4>{job.title}</h4>
                      <span className="job-cgpa-badge">CGPA ≥ {job.min_cgpa}</span>
                    </div>
                    {job.description && <p className="job-description">{job.description}</p>}
                    {job.required_skills && (
                      <p className="job-skills">
                        <strong>Skills:</strong> {job.required_skills}
                      </p>
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