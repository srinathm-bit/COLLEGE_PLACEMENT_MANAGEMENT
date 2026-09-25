import { Routes, Route } from 'react-router-dom'
import Login from './pages/login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import CompanyDashboard from './pages/CompanyDashboard.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import AdminStudents from './pages/AdminStudents.jsx'
import AdminDepartments from './pages/AdminDepartments.jsx'
import AdminCompanies from './pages/AdminCompanies.jsx'
import AdminApplications from './pages/AdminApplications.jsx'

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
        path="/admin/applications"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminApplications />
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
      <Route
        path="/admin/students"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminStudents />
          </PrivateRoute>
  }
/>
      <Route
        path="/admin/companies"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminCompanies />
          </PrivateRoute>
        }
/>
      <Route
        path="/admin/departments"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminDepartments />
          </PrivateRoute>
        }
        
/>
    </Routes>
  )
}

export default App