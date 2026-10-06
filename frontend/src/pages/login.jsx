import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/Authcontext.jsx'
import './login.css'

const LOGIN_ENDPOINTS = {
  student: '/api/auth/student/login',
  admin: '/api/auth/admin/login',
  company: '/api/auth/company/login',
}

const DASHBOARD_PATHS = {
  student: '/student-dashboard',
  admin: '/admin-dashboard',
  company: '/company-dashboard',
}

function Login() {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const response = await api.post(LOGIN_ENDPOINTS[role], { email, password })
      login(response.data.access_token, role)
      navigate(DASHBOARD_PATHS[role])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">C</div>
          <span>CPMS</span>
        </div>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to continue to your dashboard</p>

        <div className="role-tabs">
          {['student', 'admin', 'company'].map((r) => (
            <button
              key={r}
              type="button"
              className={`role-tab ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
 
export default Login