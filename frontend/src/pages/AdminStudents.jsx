import { useState, useEffect } from 'react'
import api from '../api/axios.js'
import Nav from '../components/Nav.jsx'
import './AdminStudents.css'

function AdminStudents() {
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [graduationYear, setGraduationYear] = useState('')

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    api.get('/api/admin/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    setError('')

    if (!departmentId && !graduationYear) {
      setError('Please select at least one filter: department or graduation year.')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const params = {}
      if (departmentId) params.department_id = departmentId
      if (graduationYear) params.graduation_year = graduationYear

      const res = await api.get('/api/admin/students', { params })
      setStudents(res.data)
    } catch (err) {
      setError(err.message)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  function departmentName(id) {
    const dept = departments.find((d) => d.id === id)
    return dept ? dept.code : id
  }

  return (
    <div>
      <Nav title="Admin Dashboard" />
      <div className="students-page">
        <h2>Students</h2>
        <p className="students-subtitle">Search students by department or graduation year.</p>

        <form className="filter-bar" onSubmit={handleSearch}>
          <div className="filter-group">
            <label>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Graduation Year</label>
            <input
              type="number"
              placeholder="e.g. 2026"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
            />
          </div>

          <button type="submit" className="filter-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="students-error">{error}</p>}

        {searched && !loading && !error && students.length === 0 && (
          <p className="students-empty">No students found for the selected filters.</p>
        )}

        {students.length > 0 && (
          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Grad Year</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Skills</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.roll_number}</td>
                    <td>{s.full_name}</td>
                    <td>{departmentName(s.department_id)}</td>
                    <td>{s.graduation_year}</td>
                    <td>{s.cgpa}</td>
                    <td>
                      <span className={`backlog-badge ${s.active_backlogs > 0 ? 'has-backlog' : 'clear'}`}>
                        {s.active_backlogs}
                      </span>
                    </td>
                    <td className="skills-cell">{s.skills || '—'}</td>
                    <td>{s.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminStudents