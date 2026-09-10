import { Routes, Route } from 'react-router-dom'
import Login from './pages/login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import CompanyDashboard from './pages/CompanyDashboard.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/student-dashboard"
        element={
          <PrivateRoute allowedRole="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/company-dashboard"
        element={
          <PrivateRoute allowedRole="company">
            <CompanyDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App