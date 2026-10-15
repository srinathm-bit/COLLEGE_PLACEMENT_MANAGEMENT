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
import AdminCompanyDetail from './pages/AdminCompanyDetail.jsx'
import AdminStudentDetail from './pages/AdminStudentDetail.jsx'
import CompanyJobs from './pages/CompanyJobs.jsx'
import CompanyCandidates from './pages/CompanyCandidates.jsx'
import AdminAnnouncements from './pages/AdminAnnouncements.jsx'
import Announcements from './pages/Announcements.jsx' 
import StudentJobs from './pages/StudentJobs.jsx' 

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
        path="/company/jobs"
        element={
          <PrivateRoute allowedRole="company">
            <CompanyJobs />
          </PrivateRoute>
        }
      />
      <Route
        path="/company/candidates"
        element={
          <PrivateRoute allowedRole="company">
            <CompanyCandidates />
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
      <Route
         path="/admin/companies/:id"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminCompanyDetail />
             </PrivateRoute>
        }
/>
      <Route
        path="/admin/students/:id"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminStudentDetail />
          </PrivateRoute>
        }
/>
       <Route
          path="/admin/announcements"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminAnnouncements />
            </PrivateRoute>
  }
/>
      <Route
        path="/student/announcements"
        element={
          <PrivateRoute allowedRole="student">
            <Announcements role="student" endpoint="/api/students/me/announcements" />
          </PrivateRoute>
        }
      />
      <Route
        path="/company/announcements"
        element={
          <PrivateRoute allowedRole="company">
            <Announcements role="company" endpoint="/api/companies/announcements" />
          </PrivateRoute>
        }
      />
       <Route
          path="/student/jobs"
          element={
            <PrivateRoute allowedRole="student">
              <StudentJobs />
            </PrivateRoute>
          }
/>
      
    </Routes>
  )
}

export default App
