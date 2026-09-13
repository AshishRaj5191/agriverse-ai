import RoleDashboard from './RoleDashboard';

const quickLinks = [
  { to: '/buyer/dashboard', label: 'Dashboard' },
  { to: '/buyer/profile', label: 'Buyer Profile' },
  { to: '/buyer/marketplace', label: 'Marketplace' },
  { to: '/buyer/orders', label: 'Orders' },
  { to: '/buyer/favorites', label: 'Favorites' },
];

function BuyerDashboardPage() {
  return (
    <RoleDashboard
      role="buyer"
      title="Buyer Dashboard"
      summaryCards={[
        { title: 'Saved listings', value: '18', subtitle: 'Favorites saved' },
        { title: 'Orders', value: '5', subtitle: 'This month' },
        { title: 'Preferred location', value: 'Local hub', subtitle: 'Delivery region' },
        { title: 'Status', value: 'Active', subtitle: 'Buyer account' },
      ]}
      quickLinks={quickLinks}
      profileLink="/buyer/profile"
      details={[
        { label: 'Marketplace', value: 'Marketplace landing page is ready for future product listings.' },
        { label: 'Buyer profile', value: 'Store your location and buying preferences here.' },
        { label: 'Primary activities', value: 'Browse listings, save favorites, and review order activity.' },
        { label: 'Next step', value: 'Marketplace CRUD will be added in a later phase.' },
      ]}
    />
  );
}

export default BuyerDashboardPage;
