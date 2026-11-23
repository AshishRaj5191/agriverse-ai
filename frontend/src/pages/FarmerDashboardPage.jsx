import RoleDashboard from './RoleDashboard';
import VoiceAssistant from '../components/voice/VoiceAssistant';

const quickLinks = [
  { to: '/farmer/dashboard', label: 'Dashboard' },
  { to: '/farmer/disease-detection', label: 'Disease Detection' },
  { to: '/farmer/recommendations', label: 'Recommendations' },
  { to: '/farmer/weather', label: 'Weather' },
  { to: '/farmer/experts', label: 'Experts' },
  { to: '/farmer/consultations', label: 'Consultations' },
  { to: '/farmer/government-schemes', label: 'Government Benefits' },
  { to: '/farmer/marketplace', label: 'Marketplace' },
  { to: '/farmer/farm-records', label: 'Farm Records' },
  { to: '/farmer/notifications', label: 'Notifications' },
];

function FarmerDashboardPage() {
  return (
    <div className="space-y-6">
      <VoiceAssistant compact />
      <RoleDashboard
        role="farmer"
        title="Farmer Dashboard"
        summaryCards={[
        { title: 'Current crops', value: '3', subtitle: 'Active crop records' },
        { title: 'Farm area', value: '12.5 ha', subtitle: 'Operational land' },
        { title: 'Pending alerts', value: '2', subtitle: 'Needs attention' },
        { title: '🏛️ Government Benefits', value: 'Explore', subtitle: 'Find verified government schemes, loans, insurance and agricultural support.', href: '/farmer/government-schemes', actionLabel: 'Explore Schemes' },
        ]}
        quickLinks={quickLinks}
        details={[
          { label: 'Welcome', value: 'Welcome back to your farm dashboard.' },
          { label: 'Farm info', value: 'Farm summary and crop overview will be available here.' },
          { label: 'Current crop summary', value: 'Rice, wheat, and maize planned for the season.' },
          { label: 'Upcoming actions', value: 'Check disease alerts, recommendations, and seasonal advice.' },
        ]}
      />
    </div>
  );
}

export default FarmerDashboardPage;
