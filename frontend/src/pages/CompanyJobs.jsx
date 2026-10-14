import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './CompanyJobs.css'

function skillList(skills) {
  if (!skills) return []
  return Array.isArray(skills) ? skills : String(skills).split(',').map((s) => s.trim()).filter(Boolean)
}

function CompanyJobs() {
  const [jobs, setJobs] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', min_cgpa: '', department_ids: [] })
  const [skillsList, setSkillsList] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchJobs()
    api.get('/api/companies/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]))
  }, [])

  function fetchJobs() {
    setLoading(true)
    api.get('/api/companies/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function departmentCode(id) {
    const dept = departments.find((d) => d.id === id)
    return dept ? dept.code : id
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function toggleDepartment(id) {
    setFormData((prev) => {
      const exists = prev.department_ids.includes(id)
      return {
        ...prev,
        department_ids: exists ? prev.department_ids.filter((d) => d !== id) : [...prev.department_ids, id],
      }
    })
  }

  function handleSkillKeyDown(e) {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      const trimmed = skillInput.trim()
      if (trimmed && !skillsList.includes(trimmed)) setSkillsList([...skillsList, trimmed])
      setSkillInput('')
    }
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
        required_skills: skillsList,
      })
      closeForm()
      fetchJobs()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(jobId) {
    if (!window.confirm('Delete this job? Its applications will be deleted too.')) return
    try {
      await api.delete(`/api/companies/jobs/${jobId}`)
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="cj-shell">
      <Nav role="company" title="Company" />
      <main className="cj-main">
        <div className="cj-header">
          <div>
            <h1>Jobs</h1>
            <p className="cj-subtitle">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
          </div>
          <button className="cj-btn-primary" onClick={() => setShowForm(true)}>+ Post Job</button>
        </div>

        {error && <p className="cj-error">{error}</p>}

        {loading ? (
          <div className="cj-empty">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="cj-empty">
            <p>You haven't posted any jobs yet.</p>
            <button className="cj-btn-primary" onClick={() => setShowForm(true)}>+ Post your first job</button>
          </div>
        ) : (
          <div className="cj-list">
            {jobs.map((job) => (
              <div key={job.id} className="cj-card">
                <div className="cj-card-top">
                  <div>
                    <h4>{job.title}</h4>
                    <div className="cj-tags">
                      <span className="cj-badge">CGPA ≥ {job.min_cgpa}</span>
                      {job.department_ids.map((id) => (
                        <span key={id} className="cj-tag">{departmentCode(id)}</span>
                      ))}
                    </div>
                  </div>
                  <span className="cj-date">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>

                {job.description && <p className="cj-desc">{job.description}</p>}

                {skillList(job.required_skills).length > 0 && (
                  <div className="cj-skills">
                    {skillList(job.required_skills).map((s, i) => (
                      <span key={i} className="cj-skill">{s}</span>
                    ))}
                  </div>
                )}

                <div className="cj-footer">
                  <Link to={`/company/candidates?job=${job.id}`} className="cj-link">View candidates →</Link>
                  <button className="cj-btn-danger" onClick={() => handleDelete(job.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="cj-overlay" onClick={closeForm}>
            <div className="cj-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cj-modal-header">
                <h3>Post a New Job</h3>
                <button className="cj-modal-close" onClick={closeForm}>×</button>
              </div>

              <form className="cj-form" onSubmit={handlePostJob}>
                <div className="cj-group">
                  <label>Job Title</label>
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Software Developer" required />
                </div>
                <div className="cj-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Brief job description" rows={3} />
                </div>
                <div className="cj-row">
                  <div className="cj-group">
                    <label>Minimum CGPA</label>
                    <input type="number" step="0.01" name="min_cgpa" value={formData.min_cgpa} onChange={handleChange} placeholder="e.g. 7.5" />
                  </div>
                  <div className="cj-group">
                    <label>Required Skills</label>
                    <div className="cj-chips-box">
                      {skillsList.map((skill) => (
                        <span key={skill} className="cj-chip">
                          {skill}
                          <button type="button" className="cj-chip-x" onClick={() => setSkillsList(skillsList.filter((s) => s !== skill))}>×</button>
                        </span>
                      ))}
                      <input
                        className="cj-chip-input"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder={skillsList.length === 0 ? 'Type a skill, press Enter' : ''}
                      />
                    </div>
                  </div>
                </div>
                <div className="cj-group">
                  <label>Eligible Departments</label>
                  <div className="cj-dept-row">
                    {departments.map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        className={`cj-dept ${formData.department_ids.includes(d.id) ? 'selected' : ''}`}
                        onClick={() => toggleDepartment(d.id)}
                      >
                        {d.code}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && <p className="cj-error">{formError}</p>}

                <div className="cj-modal-actions">
                  <button type="button" className="cj-btn-ghost" onClick={closeForm}>Cancel</button>
                  <button type="submit" className="cj-btn-success" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Job'}
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

export default CompanyJobs