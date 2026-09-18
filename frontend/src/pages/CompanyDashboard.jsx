import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './CompanyDashboard.css'

function CompanyDashboard() {
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [departments, setDepartments] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    min_cgpa: '',
    required_skills: '',
    department_ids: [],
  })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchJobs()
    fetchDepartments()
  }, [])

  function fetchProfile() {
    setLoadingProfile(true)
    api.get('/api/companies/me')
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingProfile(false))
  }

  function fetchJobs() {
    setLoadingJobs(true)
    api.get('/api/companies/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingJobs(false))
  }

  function fetchDepartments() {
    api.get('/api/companies/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]))
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function toggleDepartment(id) {
    setFormData((prev) => {
      const exists = prev.department_ids.includes(id)
      return {
        ...prev,
        department_ids: exists
          ? prev.department_ids.filter((d) => d !== id)
          : [...prev.department_ids, id],
      }
    })
  }

  async function handlePostJob(e) {
    e.preventDefault()
    setFormError('')

    if (formData.department_ids.length === 0) {
      setFormError('Please select at least one eligible department.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/companies/jobs', {
        ...formData,
        min_cgpa: parseFloat(formData.min_cgpa) || 0,
      })
      setFormData({ title: '', description: '', min_cgpa: '', required_skills: '', department_ids: [] })
      setShowForm(false)
      fetchJobs()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Nav title="Company Dashboard" />
      <div className="company-page">
        {error && <p className="company-error">{error}</p>}

        <div className="company-grid">
          <div className="profile-card">
            <h3>My Company</h3>
            {loadingProfile ? (
              <p className="loading-text">Loading...</p>
            ) : profile ? (
              <div className="profile-details">
                <div className="profile-row">
                  <span className="profile-label">Name</span>
                  <span>{profile.company_name}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Industry</span>
                  <span>{profile.industry || '—'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Email</span>
                  <span>{profile.email}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Contact</span>
                  <span>{profile.contact_person || '—'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Phone</span>
                  <span>{profile.contact_phone || '—'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Website</span>
                  <span>{profile.website || '—'}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="jobs-card">
            <div className="jobs-card-header">
              <h3>Posted Jobs</h3>
              <button className="post-job-button" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ Post Job'}
              </button>
            </div>

            {showForm && (
              <form className="post-job-form" onSubmit={handlePostJob}>
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Software Developer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief job description"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      name="min_cgpa"
                      value={formData.min_cgpa}
                      onChange={handleChange}
                      placeholder="e.g. 7.5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Required Skills</label>
                    <input
                      name="required_skills"
                      value={formData.required_skills}
                      onChange={handleChange}
                      placeholder="e.g. python, sql"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Eligible Departments</label>
                  <div className="department-chips">
                    {departments.map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        className={`dept-chip ${formData.department_ids.includes(d.id) ? 'selected' : ''}`}
                        onClick={() => toggleDepartment(d.id)}
                      >
                        {d.code}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && <p className="company-error">{formError}</p>}

                <button type="submit" className="submit-job-button" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Job'}
                </button>
              </form>
            )}

            {loadingJobs ? (
              <p className="loading-text">Loading...</p>
            ) : jobs.length === 0 ? (
              <p className="jobs-empty">You haven't posted any jobs yet.</p>
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
                      <p className="job-skills"><strong>Skills:</strong> {job.required_skills}</p>
                    )}
                    <p className="job-departments">
                      <strong>Departments:</strong>{' '}
                      {job.department_ids
                        .map((id) => departments.find((d) => d.id === id)?.code || id)
                        .join(', ')}
                    </p>
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

export default CompanyDashboard