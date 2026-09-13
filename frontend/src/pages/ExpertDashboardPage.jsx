import RoleDashboard from './RoleDashboard';

const quickLinks = [
  { to: '/expert/dashboard', label: 'Dashboard' },
  { to: '/expert/profile', label: 'Expert Profile' },
  { to: '/expert/consultations', label: 'Consultations' },
  { to: '/expert/requests', label: 'Requests' },
  { to: '/expert/notes', label: 'Field Notes' },
];

function ExpertDashboardPage() {
  return (
    <RoleDashboard
      role="expert"
      title="Expert Dashboard"
      summaryCards={[
        { title: 'Verification', value: 'Pending', subtitle: 'Profile review status' },
        { title: 'Clients', value: '14', subtitle: 'Active cases' },
        { title: 'Service area', value: '30 km', subtitle: 'Coverage radius' },
        { title: 'Response rate', value: '96%', subtitle: 'Timely replies' },
      ]}
      quickLinks={quickLinks}
      profileLink="/expert/profile"
      details={[
        { label: 'Specialization', value: 'Crop health and agronomy.' },
        { label: 'Current focus', value: 'Farmer advisory and field planning support.' },
        { label: 'Status', value: 'Verification status is managed in profile details.' },
        { label: 'Next action', value: 'Complete profile details and confirm service location.' },
      ]}
    />
  );
}

export default ExpertDashboardPage;
