import RoleDashboard from './RoleDashboard';

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
];

function FarmerDashboardPage() {
  return (
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
  );
}

export default FarmerDashboardPage;
