import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './StudentDashboard.css'

function skillList(skills) {
  if (!skills) return []
  return Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean)
}

function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')

  const [eligibleCount, setEligibleCount] = useState(0)
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])

  const [resumeFile, setResumeFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    fetchProfile()
    api.get('/api/students/me/jobs/eligible').then((res) => setEligibleCount(res.data.length)).catch(() => setEligibleCount(0))
    api.get('/api/students/me/applications').then((res) => setApplications(res.data)).catch(() => setApplications([]))
    api.get('/api/students/me/interviews').then((res) => setInterviews(res.data)).catch(() => setInterviews([]))
  }, [])

  function fetchProfile() {
    setLoadingProfile(true)
    api.get('/api/students/me')
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingProfile(false))
  }

  function startEdit() {
    setEditData({
      full_name: profile.full_name,
      graduation_year: profile.graduation_year,
      cgpa: profile.cgpa,
      active_backlogs: profile.active_backlogs,
      phone: profile.phone || '',
      skills: skillList(profile.skills).join(', '),
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
        skills: editData.skills ? editData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
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

  const shortlisted = applications.filter((a) => a.status === 'shortlisted' || a.status === 'interview_scheduled').length
  const selected = applications.filter((a) => a.status === 'selected').length
  const upcoming = interviews.filter((i) => i.result === 'pending').length

  const kpis = [
    { label: 'Eligible Jobs', value: eligibleCount, tone: 'blue', to: '/student/jobs?tab=eligible' },
    { label: 'Applied', value: applications.length, tone: 'plain', to: '/student/jobs?tab=applications' },
    { label: 'Shortlisted', value: shortlisted, tone: 'amber', to: '/student/jobs?tab=applications' },
    { label: 'Upcoming Interviews', value: upcoming, tone: 'teal', to: '/student/jobs?tab=interviews' },
    { label: 'Selected', value: selected, tone: 'green', to: '/student/jobs?tab=applications' },
  ]

  return (
    <div className="sd-shell">
      <Nav role="student" title="Student" />
      <main className="sd-main">
        <div className="sd-header">
          <h1>Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>
          <p className="sd-subtitle">Your placement progress at a glance.</p>
        </div>

        {error && <p className="sd-error">{error}</p>}

        <div className="sd-kpi-grid">
          {kpis.map((k) => (
            <Link key={k.label} to={k.to} className={`sd-kpi sd-tone-${k.tone}`}>
              <span className="sd-kpi-value">{k.value}</span>
              <span className="sd-kpi-label">{k.label}</span>
            </Link>
          ))}
        </div>

        <div className="sd-profile">
          {loadingProfile ? (
            <p className="sd-muted">Loading...</p>
          ) : profile && !editMode ? (
            <>
              <div className="sd-profile-top">
                <div className="sd-avatar">{profile.full_name?.charAt(0)}</div>
                <div className="sd-profile-id">
                  <p className="sd-profile-name">{profile.full_name}</p>
                  <p className="sd-muted">
                    {profile.roll_number}
                    {profile.year_label ? ` · ${profile.year_label}` : ''}
                  </p>
                </div>
                <button className="sd-btn-outline" onClick={startEdit}>Edit Profile</button>
              </div>

              <div className="sd-info-grid">
                <div className="sd-info-item"><span className="sd-info-label">Email</span><span>{profile.email}</span></div>
                <div className="sd-info-item"><span className="sd-info-label">Phone</span><span>{profile.phone || '—'}</span></div>
                <div className="sd-info-item"><span className="sd-info-label">CGPA</span><span>{profile.cgpa}</span></div>
                <div className="sd-info-item"><span className="sd-info-label">Active Backlogs</span><span>{profile.active_backlogs}</span></div>
                <div className="sd-info-item"><span className="sd-info-label">Graduation Year</span><span>{profile.graduation_year}</span></div>
                <div className="sd-info-item"><span className="sd-info-label">Current Year</span><span>{profile.year_label || '—'}</span></div>
              </div>

              <div className="sd-block">
                <span className="sd-info-label">Skills</span>
                <div className="sd-tags">
                  {skillList(profile.skills).length === 0 ? (
                    <span className="sd-muted">No skills added yet</span>
                  ) : (
                    skillList(profile.skills).map((s, i) => <span key={i} className="sd-tag">{s}</span>)
                  )}
                </div>
              </div>

              <div className="sd-block">
                <span className="sd-info-label">Resume</span>
                {profile.resume_filename ? (
                  <p className="sd-resume-current">📄 {profile.resume_filename}</p>
                ) : (
                  <p className="sd-muted">No resume uploaded yet</p>
                )}
                <form onSubmit={handleResumeUpload} className="sd-resume-form">
                  <input type="file" onChange={(e) => setResumeFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
                  <button type="submit" className="sd-btn-primary" disabled={!resumeFile || uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
                {uploadError && <p className="sd-error">{uploadError}</p>}
              </div>
            </>
          ) : profile && editMode ? (
            <form className="sd-edit-form" onSubmit={handleSaveEdit}>
              <div className="sd-edit-grid">
                <div className="sd-group">
                  <label>Full Name</label>
                  <input name="full_name" value={editData.full_name} onChange={handleEditChange} />
                </div>
                <div className="sd-group">
                  <label>Phone</label>
                  <input name="phone" value={editData.phone} onChange={handleEditChange} />
                </div>
                <div className="sd-group">
                  <label>CGPA</label>
                  <input type="number" step="0.01" name="cgpa" value={editData.cgpa} onChange={handleEditChange} />
                </div>
                <div className="sd-group">
                  <label>Active Backlogs</label>
                  <input type="number" name="active_backlogs" value={editData.active_backlogs} onChange={handleEditChange} />
                </div>
                <div className="sd-group">
                  <label>Graduation Year</label>
                  <input type="number" name="graduation_year" value={editData.graduation_year} onChange={handleEditChange} />
                </div>
                <div className="sd-group">
                  <label>Skills (comma separated)</label>
                  <input name="skills" value={editData.skills} onChange={handleEditChange} placeholder="e.g. python, sql" />
                </div>
              </div>
              {editError && <p className="sd-error">{editError}</p>}
              <div className="sd-edit-actions">
                <button type="submit" className="sd-btn-success" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="sd-btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard