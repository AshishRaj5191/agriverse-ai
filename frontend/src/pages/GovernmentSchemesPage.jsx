import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getIndianLocations } from '../services/api';

const supportCards = [
  { label: 'Crop Support', value: 'Agriculture Support', icon: '🌾', description: 'Cultivation and farm development' },
  { label: 'Financial Assistance', value: 'Financial Support', icon: '💰', description: 'Income support and farmer welfare' },
  { label: 'Agricultural Loan', value: 'Agricultural Loan', icon: '🏦', description: 'Credit for cultivation and farm needs' },
  { label: 'Crop Insurance', value: 'Crop Insurance', icon: '🛡️', description: 'Protection against notified crop losses' },
  { label: 'Farm Equipment', value: 'Farm Equipment', icon: '🚜', description: 'Equipment and mechanisation support' },
  { label: 'Irrigation', value: 'Irrigation', icon: '💧', description: 'Water and irrigation support' },
  { label: 'Agriculture Support', value: 'Agriculture Infrastructure', icon: '🌱', description: 'Infrastructure and farm development' },
  { label: 'Farmer Training', value: 'Farmer Training', icon: '📚', description: 'Training and knowledge resources' },
];

const quickActions = [
  { label: 'Financial Support', icon: '💰', action: 'financial' },
  { label: 'Agricultural Loans', icon: '🏦', action: 'loan' },
  { label: 'Crop Insurance', icon: '🛡️', action: 'insurance' },
  { label: 'Farm Equipment', icon: '🚜', action: 'equipment' },
  { label: 'Irrigation Support', icon: '💧', action: 'irrigation' },
  { label: 'Agriculture Support', icon: '🌱', action: 'agriculture' },
  { label: 'Eligibility & Documents', icon: '📄', action: 'eligibility' },
  { label: 'Official Government Portals', icon: '🌐', action: 'portals' },
];

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-GB') : 'Not available';
}

function VerificationBadge({ scheme }) {
  if (!scheme.lastVerifiedAt || !scheme.sourceUrl) {
    return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">⚠️ Verification Required</span>;
  }

  const ageInDays = Math.floor((Date.now() - new Date(scheme.lastVerifiedAt).getTime()) / 86400000);
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{ageInDays <= 90 ? '🕒 Recently Verified' : '✓ Verified Government Source'}</span>;
}

function ExternalLink({ href, children, highlighted = false, className = '' }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${highlighted ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'} ${className}`}>
      {children}
    </a>
  );
}

function SchemeCard({ scheme }) {
  const isPmKisan = scheme.id === 'pm-kisan';
  const isPmfbY = scheme.id === 'pmfby';
  const isKcc = scheme.id === 'kisan-credit-card-kcc';
  const statusUrl = isPmKisan || isPmfbY ? scheme.officialStatusUrl : '';

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2"><div className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-800">{scheme.governmentLevel}</div><VerificationBadge scheme={scheme} /></div>
          <h3 className="mt-3 text-xl font-bold text-slate-900">{scheme.title}</h3>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{scheme.category}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{scheme.description}</p>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Important highlights</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">{(scheme.benefits || []).slice(0, 3).map((benefit) => <li key={benefit}>✓ {benefit}</li>)}</ul>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-slate-500">Who it is for</p><p className="mt-1">{scheme.targetFarmers}</p></div>
        <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-slate-500">Eligibility</p><p className="mt-1">{scheme.eligibility?.[0] || 'Verify current eligibility on the official source.'}</p></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Documents commonly required: {scheme.documents?.length || 0} listed for this scheme. Documents vary by scheme and applicant.</p>
      <p className="mt-4 text-xs text-slate-500">Last verified: {formatDate(scheme.lastVerifiedAt)} · Source: {scheme.sourceName || 'Official Government Portal'}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link to={`/farmer/government-schemes/${scheme.slug || scheme.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">View Details</Link>
        {statusUrl ? <ExternalLink href={statusUrl} highlighted>{isPmKisan ? 'Check Beneficiary / Payment Status ↗' : 'Check Application / Policy Status ↗'}</ExternalLink> : null}
        {scheme.officialWebsite ? <ExternalLink href={scheme.officialWebsite}>{isKcc ? 'Official Information ↗' : 'Official Website ↗'}</ExternalLink> : null}
      </div>
    </article>
  );
}

function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [locations, setLocations] = useState({ states: [], districtsByState: {} });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [governmentLevel, setGovernmentLevel] = useState('All');
  const [category, setCategory] = useState('All');
  const [contentFilter, setContentFilter] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [locationFilterActive, setLocationFilterActive] = useState(false);
  const [sortOrder, setSortOrder] = useState('relevant');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [schemeResponse, profileResponse, locationResponse] = await Promise.all([
          api.get('/government-schemes'),
          api.get('/farmers/profile').catch(() => ({ data: { data: { profile: null } } })),
          getIndianLocations(),
        ]);
        if (cancelled) return;
        const profileData = profileResponse?.data?.data?.profile || null;
        const locationData = locationResponse?.data || { states: [], districtsByState: {} };
        const profileState = profileData?.state || locationData.states[0] || '';
        setSchemes(schemeResponse?.data?.data || []);
        setLocations(locationData);
        setProfile(profileData);
        setState(profileState);
        setDistrict(profileData?.district || locationData.districtsByState[profileState]?.[0] || '');
        setLocationFilterActive(false);
      } catch (err) {
        if (!cancelled) setError('Unable to load government schemes right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [retryToken]);

  const savedState = profile?.state || locations.states[0] || '';
  const savedDistrict = profile?.district || locations.districtsByState[savedState]?.[0] || '';
  const selectedState = state || savedState;
  const selectedDistrict = district || savedDistrict;
  const availableStates = locations.states.includes(selectedState) ? locations.states : [selectedState, ...locations.states];
  const availableDistricts = locations.districtsByState[selectedState] || (selectedDistrict ? [selectedDistrict] : []);

  const filteredSchemes = useMemo(() => {
    const filtered = schemes.filter((scheme) => {
      if (scheme.isActive === false) return false;
      if (governmentLevel !== 'All' && scheme.governmentLevel !== governmentLevel) return false;
      if (category !== 'All' && scheme.category !== category) return false;
      if (scheme.governmentLevel === 'State Government' && scheme.state !== selectedState) return false;
      if (contentFilter === 'eligibility' && !(scheme.eligibility || []).length) return false;
      if (contentFilter === 'documents' && !(scheme.documents || []).length) return false;
      return true;
    });

    return filtered.sort((first, second) => {
      if (sortOrder === 'alphabetical') return first.title.localeCompare(second.title);
      if (sortOrder === 'recent') return new Date(second.lastVerifiedAt || 0) - new Date(first.lastVerifiedAt || 0);
      const firstStateMatch = first.governmentLevel === 'State Government' && first.state === selectedState ? 1 : 0;
      const secondStateMatch = second.governmentLevel === 'State Government' && second.state === selectedState ? 1 : 0;
      if (firstStateMatch !== secondStateMatch) return secondStateMatch - firstStateMatch;
      const firstCentral = first.governmentLevel === 'Central Government' ? 1 : 0;
      const secondCentral = second.governmentLevel === 'Central Government' ? 1 : 0;
      if (firstCentral !== secondCentral) return secondCentral - firstCentral;
      return new Date(second.lastVerifiedAt || 0) - new Date(first.lastVerifiedAt || 0);
    });
  }, [category, contentFilter, governmentLevel, schemes, selectedState, sortOrder]);

  const centralSchemes = filteredSchemes.filter((scheme) => scheme.governmentLevel === 'Central Government');
  const stateSchemes = filteredSchemes.filter((scheme) => scheme.governmentLevel === 'State Government');
  const showStateSection = governmentLevel === 'All' || governmentLevel === 'State Government';

  const clearAllFilters = () => {
    setCategory('All');
    setContentFilter('');
    setGovernmentLevel('All');
    setState(savedState);
    setDistrict(savedDistrict);
    setLocationFilterActive(false);
    setSortOrder('relevant');
  };

  const changeState = (nextState) => {
    setState(nextState);
    setDistrict('');
    setLocationFilterActive(true);
  };

  const runQuickAction = (action) => {
    if (action === 'financial') setCategory('Financial Support');
    if (action === 'loan') setCategory('Agricultural Loan');
    if (action === 'insurance') setCategory('Crop Insurance');
    if (action === 'equipment') setCategory('Farm Equipment');
    if (action === 'irrigation') setCategory('Irrigation');
    if (action === 'agriculture') setCategory('Agriculture Infrastructure');
    if (action === 'eligibility') setContentFilter('eligibility');
    if (action === 'portals') document.getElementById('official-portals')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeFilter = (filter) => {
    if (filter === 'category') setCategory('All');
    if (filter === 'content') setContentFilter('');
    if (filter === 'governmentLevel') setGovernmentLevel('All');
    if (filter === 'state') {
      setState(savedState);
      setDistrict(savedDistrict);
      setLocationFilterActive(false);
    }
    if (filter === 'district') {
      setDistrict(savedDistrict);
      setLocationFilterActive(state !== savedState);
    }
  };

  const resultLabel = `${filteredSchemes.length} ${filteredSchemes.length === 1 ? 'government scheme' : 'government schemes'} found for ${selectedState}`;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Farmer benefits</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Government Benefits Center</h1><p className="mt-2 max-w-3xl text-slate-600">Find government schemes, financial assistance, loans, insurance and agricultural support in one place.</p></div>
          <div className="rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 shadow-sm"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">📍 Your saved location</div><div className="mt-1 text-sm font-semibold text-slate-800">{savedState} / {savedDistrict || 'District'}</div><button type="button" onClick={() => document.getElementById('scheme-filters')?.scrollIntoView({ behavior: 'smooth' })} className="mt-3 text-sm font-semibold text-emerald-700">Change viewing location</button></div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Quick Farmer Services</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-8">{quickActions.map((action) => <button key={action.label} type="button" onClick={() => runQuickAction(action.action)} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-sm"><span className="text-xl" aria-hidden="true">{action.icon}</span><span className="mt-2 block text-sm font-semibold text-slate-800">{action.label}</span></button>)}</div>
      </section>

      <section id="scheme-filters" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Viewing Filters</h2>
        <button type="button" onClick={() => setShowFilters((value) => !value)} className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 md:hidden">{showFilters ? 'Hide filters' : 'Show filters'}</button>
        <div className={`${showFilters ? 'grid' : 'hidden'} mt-4 gap-4 md:grid md:grid-cols-2 lg:grid-cols-4`}>
          <label className="text-sm font-medium text-slate-700">Government Level<select value={governmentLevel} onChange={(event) => setGovernmentLevel(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="All">All</option><option value="Central Government">Central Government</option><option value="State Government">State Government</option></select></label>
          <label className="text-sm font-medium text-slate-700">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="All">All</option><option value="Financial Support">Financial Support</option><option value="Agricultural Loan">Agricultural Loan</option><option value="Crop Insurance">Crop Insurance</option><option value="Farm Equipment">Farm Equipment</option><option value="Irrigation">Irrigation</option><option value="Agriculture Infrastructure">Agriculture Infrastructure</option><option value="Agriculture Support">Agriculture Support</option><option value="Farmer Training">Farmer Training</option><option value="Other">Other</option></select></label>
          <label className="text-sm font-medium text-slate-700">State<select value={selectedState} onChange={(event) => changeState(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal">{availableStates.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">District<select value={selectedDistrict} onChange={(event) => { setDistrict(event.target.value); setLocationFilterActive(true); }} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="">Select district</option>{availableDistricts.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        </div>
        <div className={`${showFilters ? 'flex' : 'hidden'} mt-4 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:flex`}><label className="text-sm font-medium text-slate-700">Sort results<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="relevant">Most Relevant</option><option value="recent">Recently Verified</option><option value="alphabetical">A-Z</option></select></label><button type="button" onClick={clearAllFilters} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear All Filters</button></div>
        <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">Viewing schemes for selected location. Your saved profile location will not be changed. <strong>{selectedState} / {selectedDistrict || 'District'}</strong></p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">What do you need help with?</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-8">{supportCards.map((card) => <button key={card.label} type="button" aria-pressed={category === card.value} onClick={() => setCategory(category === card.value ? 'All' : card.value)} className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${category === card.value ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}><div className="text-2xl">{card.icon}</div><p className="mt-3 text-sm font-bold text-slate-900">{card.label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{card.description}</p></button>)}</div>
      </section>

      {(category !== 'All' || contentFilter || governmentLevel !== 'All' || locationFilterActive) ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-700">Active filters:</span>{category !== 'All' ? <FilterChip label={`Category: ${category}`} onRemove={() => removeFilter('category')} /> : null}{contentFilter ? <FilterChip label={contentFilter === 'eligibility' ? 'Eligibility information' : 'Documents available'} onRemove={() => removeFilter('content')} /> : null}{governmentLevel !== 'All' ? <FilterChip label={governmentLevel} onRemove={() => removeFilter('governmentLevel')} /> : null}{locationFilterActive ? <><FilterChip label={selectedState} onRemove={() => removeFilter('state')} />{selectedDistrict ? <FilterChip label={selectedDistrict} onRemove={() => removeFilter('district')} /> : null}</> : null}</div></section> : null}

      {profile ? <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><h2 className="text-lg font-bold text-slate-900">Potentially relevant to your profile</h2><p className="mt-2 text-sm text-slate-700">Based on your saved location: {savedState} / {savedDistrict}. You may be eligible for some schemes. Verify the official eligibility criteria.</p></section> : null}

      <section className="space-y-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Benefits for your selected location</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{loading ? 'Loading schemes...' : error ? 'Results unavailable' : resultLabel}</h2></div></div>
        {loading ? <SkeletonGrid /> : error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-7 text-center"><p className="text-sm text-red-700">Government scheme information is temporarily unavailable.</p><button type="button" onClick={() => setRetryToken((value) => value + 1)} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">Retry</button></div> : filteredSchemes.length === 0 ? (governmentLevel === 'State Government' ? <StateEmpty selectedState={selectedState} onViewCentral={() => setGovernmentLevel('All')} /> : <FilterEmpty onClear={clearAllFilters} />) : <><section className="space-y-4"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">🇮🇳 Central Government Schemes</p><h3 className="mt-1 text-2xl font-bold text-slate-900">Central Government Schemes</h3></div>{governmentLevel === 'State Government' ? null : centralSchemes.length ? <div className="grid gap-4 xl:grid-cols-2">{centralSchemes.map((scheme) => <SchemeCard key={scheme.id || scheme.slug} scheme={scheme} />)}</div> : null}</section>{showStateSection ? <section className="space-y-4"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">📍 Verified State Government Schemes</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedState} Government Schemes</h3></div>{stateSchemes.length ? <div className="grid gap-4 xl:grid-cols-2">{stateSchemes.map((scheme) => <SchemeCard key={scheme.id || scheme.slug} scheme={scheme} />)}</div> : <StateEmpty selectedState={selectedState} onViewCentral={() => setGovernmentLevel('All')} />}</section> : null}</>}
      </section>
      <section id="official-portals" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold text-slate-900">Official Farmer Portals</h2><p className="mt-2 text-sm text-slate-600">Open only the official sources stored for the schemes in this center.</p><div className="mt-4 flex flex-wrap gap-2">{schemes.filter((scheme) => scheme.officialWebsite).map((scheme) => <ExternalLink key={scheme.id || scheme.slug} href={scheme.officialWebsite}>{scheme.id === 'kisan-credit-card-kcc' ? 'MyScheme ↗' : scheme.title.replace(' Samman Nidhi', '') + ' ↗'}</ExternalLink>)}</div></section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><h2 className="font-bold">⚠️ Stay Safe</h2><p className="mt-2">AgriVerse never asks for OTP, UPI PIN, bank password or government portal credentials.</p><p className="mt-1">Always verify scheme information on the official government portal. Final eligibility remains with the government authority.</p></section>
    </div>
  );
}

function FilterChip({ label, onRemove }) { return <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800" aria-label={`Remove ${label} filter`}>{label} <span aria-hidden="true">×</span></button>; }
function SkeletonGrid() { return <div className="grid gap-4 xl:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div>; }
function FilterEmpty({ onClear }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="text-slate-700">No schemes match the selected filters.</p><button type="button" onClick={onClear} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Clear All Filters</button></div>; }
function StateEmpty({ selectedState, onViewCentral }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><p className="text-sm text-slate-700">No verified state-specific scheme has been added yet for {selectedState}.</p><p className="mt-1 text-sm text-slate-500">Central Government schemes are still available.</p><button type="button" onClick={onViewCentral} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">View Central Schemes</button></div>; }

export default GovernmentSchemesPage;
