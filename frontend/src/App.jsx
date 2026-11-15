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
import FarmerExpertsPage from './pages/FarmerExpertsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UsersManagementPage from './pages/UsersManagementPage'
import ExpertsManagementPage from './pages/ExpertsManagementPage'
import FarmRecordsListPage from './pages/farmer/FarmRecordsListPage'
import AddFarmRecordPage from './pages/farmer/AddFarmRecordPage'
import FarmRecordDetailsPage from './pages/farmer/FarmRecordDetailsPage'
import FarmerExpertConsultationPage from './pages/FarmerExpertConsultationPage'
import FarmerConsultationsPage from './pages/FarmerConsultationsPage'
import ExpertConsultationsPage from './pages/ExpertConsultationsPage'
import GovernmentSchemesPage from './pages/GovernmentSchemesPage'
import GovernmentSchemeDetailsPage from './pages/GovernmentSchemeDetailsPage'
import AdminGovernmentSchemesPage from './pages/AdminGovernmentSchemesPage'
import VoiceAssistantPage from './pages/VoiceAssistantPage'
import WeatherPage from './pages/WeatherPage'
import DiseaseDetectionPage from './pages/DiseaseDetectionPage'
import CropRecommendationPage from './pages/CropRecommendationPage'
import FertilizerRecommendationPage from './pages/FertilizerRecommendationPage'
import MarketplacePage from './pages/MarketplacePage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import MarketplaceMessagesPage from './pages/MarketplaceMessagesPage'
import FarmerNotificationsPage from './pages/FarmerNotificationsPage'

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
            path="/farmer/experts"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerExpertsPage />
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
          <Route path="/farmer/expert-consultation/:expertId" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerExpertConsultationPage /></ProtectedRoute>} />
          <Route path="/farmer/consultations" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerConsultationsPage /></ProtectedRoute>} />
          <Route path="/farmer/consultations/:id" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerConsultationsPage /></ProtectedRoute>} />
          <Route path="/farmer/government-schemes" element={<ProtectedRoute allowedRoles={['farmer']}><GovernmentSchemesPage /></ProtectedRoute>} />
          <Route path="/farmer/government-schemes/:schemeId" element={<ProtectedRoute allowedRoles={['farmer']}><GovernmentSchemeDetailsPage /></ProtectedRoute>} />
          <Route path="/farmer/voice-assistant" element={<ProtectedRoute allowedRoles={['farmer']}><VoiceAssistantPage /></ProtectedRoute>} />
          <Route path="/farmer/weather" element={<ProtectedRoute allowedRoles={['farmer']}><WeatherPage /></ProtectedRoute>} />
          <Route path="/farmer/disease-detection" element={<ProtectedRoute allowedRoles={['farmer']}><DiseaseDetectionPage /></ProtectedRoute>} />
          <Route path="/farmer/recommendations" element={<ProtectedRoute allowedRoles={['farmer']}><CropRecommendationPage /></ProtectedRoute>} />
          <Route path="/farmer/crop-recommendation" element={<ProtectedRoute allowedRoles={['farmer']}><CropRecommendationPage /></ProtectedRoute>} />
          <Route path="/farmer/fertilizer-recommendation" element={<ProtectedRoute allowedRoles={['farmer']}><FertilizerRecommendationPage /></ProtectedRoute>} />
          <Route path="/farmer/marketplace" element={<ProtectedRoute allowedRoles={['farmer']}><MarketplacePage /></ProtectedRoute>} />
          <Route path="/farmer/marketplace/:id" element={<ProtectedRoute allowedRoles={['farmer']}><ProductDetailsPage /></ProtectedRoute>} />
          <Route path="/farmer/messages" element={<ProtectedRoute allowedRoles={['farmer']}><MarketplaceMessagesPage /></ProtectedRoute>} />
          <Route path="/farmer/notifications" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerNotificationsPage /></ProtectedRoute>} />
          <Route path="/buyer/marketplace" element={<ProtectedRoute allowedRoles={['buyer']}><MarketplacePage /></ProtectedRoute>} />
          <Route path="/buyer/marketplace/:id" element={<ProtectedRoute allowedRoles={['buyer']}><ProductDetailsPage /></ProtectedRoute>} />
          <Route path="/buyer/messages" element={<ProtectedRoute allowedRoles={['buyer']}><MarketplaceMessagesPage /></ProtectedRoute>} />

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
          <Route path="/expert/consultations" element={<ProtectedRoute allowedRoles={['expert']}><ExpertConsultationsPage /></ProtectedRoute>} />
          <Route path="/expert/consultations/:id" element={<ProtectedRoute allowedRoles={['expert']}><ExpertConsultationsPage /></ProtectedRoute>} />

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
          <Route
            path="/admin/government-schemes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGovernmentSchemesPage />
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
