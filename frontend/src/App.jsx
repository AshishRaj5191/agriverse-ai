import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboardPage from './pages/AdminDashboardPage'
import BuyerDashboardPage from './pages/BuyerDashboardPage'
import BuyerProfilePage from './pages/BuyerProfilePage'
import ExpertDashboardPage from './pages/ExpertDashboardPage'
import ExpertProfilePage from './pages/ExpertProfilePage'
import FarmerDashboardPage from './pages/FarmerDashboardPage'
import FarmerProfilePage from './pages/FarmerProfilePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UsersManagementPage from './pages/UsersManagementPage'
import ExpertsManagementPage from './pages/ExpertsManagementPage'
import FarmRecordsListPage from './pages/farmer/FarmRecordsListPage'
import AddFarmRecordPage from './pages/farmer/AddFarmRecordPage'
import FarmRecordDetailsPage from './pages/farmer/FarmRecordDetailsPage'

function App() {
  return (
    <div className="min-h-screen bg-field text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/profile"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/farm-records"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmRecordsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/farm-records/add"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <AddFarmRecordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/farm-records/:id"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmRecordDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/expert/dashboard"
            element={
              <ProtectedRoute allowedRoles={['expert']}>
                <ExpertDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/profile"
            element={
              <ProtectedRoute allowedRoles={['expert']}>
                <ExpertProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/profile"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/experts"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExpertsManagementPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
