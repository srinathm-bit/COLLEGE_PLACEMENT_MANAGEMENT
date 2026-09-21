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
    department_ids: [],
  })
  const [skillsList, setSkillsList] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [expandedJobId, setExpandedJobId] = useState(null)
  const [applicantsByJob, setApplicantsByJob] = useState({})
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)

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

  function handleSkillInputKeyDown(e) {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      const trimmed = skillInput.trim()
      if (trimmed && !skillsList.includes(trimmed)) {
        setSkillsList([...skillsList, trimmed])
      }
      setSkillInput('')
    }
  }

  function removeSkill(skillToRemove) {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove))
  }

  function closeForm() {
    setShowForm(false)
    setFormData({ title: '', description: '', min_cgpa: '', department_ids: [] })
    setSkillsList([])
    setSkillInput('')
    setFormError('')
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
        required_skills: skillsList.join(', '),
      })
      closeForm()
      fetchJobs()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteJob(jobId) {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return

    try {
      await api.delete(`/api/companies/jobs/${jobId}`)
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleApplicants(jobId) {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }

    setExpandedJobId(jobId)

    if (!applicantsByJob[jobId]) {
      setLoadingApplicants(true)
      try {
        const res = await api.get(`/api/companies/jobs/${jobId}/applicants`)
        setApplicantsByJob((prev) => ({ ...prev, [jobId]: res.data }))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingApplicants(false)
      }
    }
  }

  async function handleStatusChange(applicationId, newStatus, jobId) {
    setUpdatingStatusId(applicationId)
    try {
      await api.put(`/api/companies/applications/${applicationId}/status`, { status: newStatus })
      setApplicantsByJob((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((a) =>
          a.application_id === applicationId ? { ...a, status: newStatus } : a
        ),
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingStatusId(null)
    }
  }

  function statusBadgeClass(status) {
    if (status === 'selected') return 'status-selected'
    if (status === 'rejected') return 'status-rejected'
    if (status === 'shortlisted') return 'status-shortlisted'
    if (status === 'interview_scheduled') return 'status-interview'
    return 'status-applied'
  }

  function departmentName(id) {
    const dept = departments.find((d) => d.id === id)
    return dept ? dept.code : id
  }

  const applicantCount = (jobId) => applicantsByJob[jobId]?.length

  return (
    <div>
      <Nav title="Company Dashboard" />
      <div className="company-page">
        {error && <p className="company-error">{error}</p>}

        <div className="company-grid">
          {/* Profile summary */}
          <div className="profile-card">
            <h3>Company Profile</h3>
            {loadingProfile ? (
              <p className="loading-text">Loading...</p>
            ) : profile ? (
              <div className="profile-details">
                <div className="profile-avatar">{profile.company_name?.charAt(0)}</div>
                <p className="profile-company-name">{profile.company_name}</p>
                <p className="profile-industry">{profile.industry || 'Industry not set'}</p>

                <div className="profile-divider" />

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

          {/* Jobs */}
          <div className="jobs-section">
            <div className="jobs-section-header">
              <div>
                <h3>Posted Jobs</h3>
                <p className="jobs-section-subtitle">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
              </div>
              <button className="post-job-button" onClick={() => setShowForm(true)}>
                + Post Job
              </button>
            </div>

            {loadingJobs ? (
              <p className="loading-text">Loading...</p>
            ) : jobs.length === 0 ? (
              <div className="jobs-empty">
                <p>You haven't posted any jobs yet.</p>
                <button className="post-job-button" onClick={() => setShowForm(true)}>
                  + Post your first job
                </button>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-card-top">
                      <div>
                        <h4>{job.title}</h4>
                        <div className="job-tags">
                          <span className="tag tag-cgpa">CGPA ≥ {job.min_cgpa}</span>
                          {job.department_ids.map((id) => (
                            <span key={id} className="tag tag-dept">{departmentName(id)}</span>
                          ))}
                        </div>
                      </div>
                      <button className="delete-icon-button" onClick={() => handleDeleteJob(job.id)} title="Delete job">
                        🗑
                      </button>
                    </div>

                    {job.description && <p className="job-description">{job.description}</p>}
                    {job.required_skills && (
                      <p className="job-skills-line">{job.required_skills}</p>
                    )}

                    <button className="applicants-toggle" onClick={() => toggleApplicants(job.id)}>
                      <span>{expandedJobId === job.id ? '▾' : '▸'} Applicants</span>
                      {applicantCount(job.id) !== undefined && (
                        <span className="applicant-count">{applicantCount(job.id)}</span>
                      )}
                    </button>

                    {expandedJobId === job.id && (
                      <div className="applicants-panel">
                        {loadingApplicants && !applicantsByJob[job.id] ? (
                          <p className="loading-text">Loading applicants...</p>
                        ) : applicantsByJob[job.id]?.length === 0 ? (
                          <p className="applicants-empty">No applicants yet.</p>
                        ) : (
                          <div className="applicants-list">
                            {applicantsByJob[job.id]?.map((a) => (
                              <div key={a.application_id} className="applicant-row">
                                <div className="applicant-main">
                                  <span className="applicant-name">{a.full_name}</span>
                                  <span className="applicant-roll">{a.roll_number} · {departmentName(a.department_id)} · CGPA {a.cgpa}</span>
                                </div>
                                <div className="applicant-side">
                                  <span className={`applicant-status-badge ${statusBadgeClass(a.status)}`}>
                                    {a.status.replace('_', ' ')}
                                  </span>
                                  <div className="status-actions">
                                    <button
                                      className="status-action shortlist"
                                      disabled={updatingStatusId === a.application_id}
                                      onClick={() => handleStatusChange(a.application_id, 'shortlisted', job.id)}
                                    >
                                      Shortlist
                                    </button>
                                    <button
                                      className="status-action select"
                                      disabled={updatingStatusId === a.application_id}
                                      onClick={() => handleStatusChange(a.application_id, 'selected', job.id)}
                                    >
                                      Select
                                    </button>
                                    <button
                                      className="status-action reject"
                                      disabled={updatingStatusId === a.application_id}
                                      onClick={() => handleStatusChange(a.application_id, 'rejected', job.id)}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Post Job Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={closeForm}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Post a New Job</h3>
                <button className="modal-close" onClick={closeForm}>×</button>
              </div>

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
                    <div className="chips-input-box">
                      {skillsList.map((skill) => (
                        <span key={skill} className="skill-chip">
                          {skill}
                          <button type="button" className="skill-chip-remove" onClick={() => removeSkill(skill)}>×</button>
                        </span>
                      ))}
                      <input
                        className="chip-text-input"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillInputKeyDown}
                        placeholder={skillsList.length === 0 ? 'Type a skill, press Enter' : ''}
                      />
                    </div>
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

                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={closeForm}>Cancel</button>
                  <button type="submit" className="submit-job-button" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyDashboard