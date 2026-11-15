import { Link, useLocation } from 'react-router-dom';

const moduleCopy = {
  weather: {
    title: 'Weather Information',
    message: 'The current project does not have a configured weather data service, so AgriVerse will not show invented forecast values.',
    action: 'Return to Voice Assistant',
    href: '/farmer/voice-assistant',
  },
  marketplace: {
    title: 'Marketplace',
    message: 'Farmers can sell animals and farm products with photos, prices, PIN code, district, and state. Buyers can search listings by location.',
    action: 'Open Marketplace',
    href: '/farmer/marketplace',
  },
  disease: {
    title: 'Disease Detection',
    message: 'Upload a crop image from a farm record to use the existing AI disease prediction service. Voice alone cannot diagnose a crop disease.',
    action: 'Open Farm Records',
    href: '/farmer/farm-records',
  },
};

function FarmerModuleGatewayPage() {
  const { pathname } = useLocation();
  const key = pathname.includes('weather') ? 'weather' : pathname.includes('marketplace') ? 'marketplace' : 'disease';
  const copy = moduleCopy[key];

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">AgriVerse module</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{copy.title}</h1>
      <p className="mt-4 leading-7 text-slate-600">{copy.message}</p>
      <Link to={copy.href} className="mt-6 inline-flex rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800">{copy.action} →</Link>
    </div>
  );
}

export default FarmerModuleGatewayPage;
