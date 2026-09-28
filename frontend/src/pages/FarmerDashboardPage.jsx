import { Link } from 'react-router-dom'
import RoleDashboard from './RoleDashboard'

const quickLinks = [
  { to: '/farmer/dashboard', label: 'Dashboard' },
  { to: '/farmer/profile', label: 'Farmer Profile' },
  { to: '/farmer/disease-detection', label: 'Disease Detection' },
  { to: '/farmer/recommendations', label: 'Recommendations' },
  { to: '/farmer/weather', label: 'Weather' },
  { to: '/farmer/experts', label: 'Experts' },
  { to: '/farmer/marketplace', label: 'Marketplace' },
  { to: '/farmer/farm-records', label: 'Farm Records' },
  { to: '/farmer/notifications', label: 'Notifications' },
]

function FarmerDashboardPage() {
  return (
    <div className="space-y-6">
      <RoleDashboard
        role="farmer"
        title="Farmer Dashboard"
        summaryCards={[
          { title: 'Profile status', value: 'Ready', subtitle: 'Farmer profile setup' },
          { title: 'Current crops', value: '3', subtitle: 'Active crop records' },
          { title: 'Farm area', value: '12.5 ha', subtitle: 'Operational land' },
          { title: 'Pending alerts', value: '2', subtitle: 'Needs attention' },
        ]}
        quickLinks={quickLinks}
        profileLink="/farmer/profile"
        details={[
          { label: 'Welcome', value: 'Welcome back to your farm dashboard.' },
          { label: 'Farm info', value: 'Farm summary and crop overview will be available here.' },
          { label: 'Current crop summary', value: 'Rice, wheat, and maize planned for the season.' },
          { label: 'Upcoming actions', value: 'Check disease alerts, recommendations, and seasonal advice.' },
        ]}
      />

      <section className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-green-700">
              AgriVerse AI
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              AI Leaf Scanner
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload a crop leaf image and check for possible plant disease
              using the AgriVerse AI disease detection model.
            </p>
          </div>

          <Link
            to="/farmer/disease-detection"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
          >
            Scan Leaf
          </Link>
        </div>
      </section>
    </div>
  )
}

export default FarmerDashboardPage
