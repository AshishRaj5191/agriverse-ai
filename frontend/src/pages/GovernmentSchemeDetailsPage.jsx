import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

function GovernmentSchemeDetailsPage() {
  const { schemeId } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadScheme() {
      try {
        const response = await api.get(`/government-schemes/${schemeId}`);
        setScheme(response?.data?.data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load government scheme details.');
      } finally {
        setLoading(false);
      }
    }
    loadScheme();
  }, [schemeId]);

  if (loading) return <div className="grid gap-4 md:grid-cols-2"><div className="h-56 animate-pulse rounded-2xl bg-slate-100" /><div className="h-56 animate-pulse rounded-2xl bg-slate-100" /></div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  if (!scheme) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Scheme not found.</div>;

  const statusUrl = scheme.officialStatusUrl || scheme.statusUrl;
  const applicationUrl = scheme.officialApplicationUrl || scheme.applicationUrl;
  const verifiedDate = scheme.lastVerifiedAt ? new Date(scheme.lastVerifiedAt).toLocaleDateString('en-GB') : 'Not available';

  return (
    <div className="space-y-6">
      <Link to="/farmer/government-schemes" className="inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">← Back to Government Benefits Center</Link>
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">{scheme.governmentLevel} · {scheme.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{scheme.title}</h1>
            <p className="mt-2 max-w-3xl text-slate-600">{scheme.description}</p>
          </div>
          <a href={applicationUrl || scheme.officialWebsite} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">Visit Official Government Portal ↗</a>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,0.9fr]">
        <main className="space-y-6">
          <InfoSection title="Overview"><p>{scheme.description}</p></InfoSection>
          <InfoSection title="Who is it for?"><p>{scheme.targetFarmers}</p></InfoSection>
          <ListSection title="Key Benefits" items={scheme.benefits} />
          <ListSection title="Eligibility" items={scheme.eligibility} />
          <InfoSection title="Documents commonly required"><p className="mb-3 text-sm text-slate-600">Documents vary by scheme and applicant.</p><ListItems items={scheme.documents} /></InfoSection>
          <ListSection title="How to Apply" items={scheme.applicationSteps} ordered />
          <InfoSection title="Before You Apply"><ol className="list-decimal space-y-2 pl-5"><li>Check eligibility on the official source.</li><li>Prepare the required documents.</li><li>Open the official government portal.</li><li>Submit the official application through the authorised channel.</li><li>Save the application or reference number where provided.</li><li>Track status through the official authority.</li></ol></InfoSection>
          <InfoSection title="Important Information"><ul className="list-disc space-y-2 pl-5"><li>Information on this page is AgriVerse guidance, not an approval or eligibility decision.</li><li>Verify current rules, terms, deadlines and requirements on the official government source.</li><li>AgriVerse does not collect OTPs, bank passwords, UPI PINs or government portal credentials.</li></ul></InfoSection>
        </main>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Official Links</h2>
            <div className="mt-4 space-y-3">
              {scheme.officialWebsite ? <ExternalButton label="Official Website ↗" href={scheme.officialWebsite} /> : null}
              {statusUrl ? <ExternalButton label={scheme.id === 'pm-kisan' ? 'Check Beneficiary / Payment Status ↗' : scheme.id === 'pmfby' ? 'Check Application / Policy Status ↗' : 'Check Live Status on Official Portal ↗'} href={statusUrl} highlighted /> : null}
              {applicationUrl ? <ExternalButton label={scheme.id === 'pmfby' ? 'Apply / Learn More ↗' : 'Official Application Information ↗'} href={applicationUrl} /> : null}
            </div>
            {scheme.id === 'pmfby' ? <p className="mt-4 text-xs leading-5 text-slate-500">Use the official PMFBY portal for enrollment, premium calculator, application status, loss reporting and grievance services.</p> : null}
            {scheme.id === 'pm-kisan' ? <p className="mt-4 text-xs leading-5 text-slate-500">Use the official PM-KISAN portal to check your live beneficiary and payment status. Do not share OTPs or credentials with AgriVerse.</p> : null}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Verification</h2>
            <p className="mt-3 text-sm text-slate-700">Last verified: {verifiedDate}</p>
            <p className="mt-2 text-sm text-slate-700">Source: {scheme.sourceName || 'Official Government Portal'}</p>
            {scheme.sourceUrl ? <a href={scheme.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-emerald-700">Open source ↗</a> : null}
          </section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <h2 className="font-bold">Disclaimer</h2>
            <p className="mt-2">Final eligibility, approval, payment, premium, loan terms and sanction are determined by the official authority or participating institution.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoSection({ title, children }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold text-slate-900">{title}</h2><div className="mt-3 text-sm leading-6 text-slate-700">{children}</div></section>;
}

function ListSection({ title, items = [], ordered = false }) {
  const List = ordered ? 'ol' : 'ul';
  return <InfoSection title={title}><ListItems items={items} ordered={ordered} /></InfoSection>;
}

function ListItems({ items = [], ordered = false }) {
  const List = ordered ? 'ol' : 'ul';
  return <List className={`${ordered ? 'list-decimal' : 'list-disc'} space-y-2 pl-5`}>{items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>Please verify current details on the official government source.</li>}</List>;
}

function ExternalButton({ label, href, highlighted = false }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`block w-full rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${highlighted ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>{label}</a>;
}

export default GovernmentSchemeDetailsPage;
