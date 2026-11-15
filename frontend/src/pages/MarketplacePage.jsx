import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createMarketplaceProduct, deleteMarketplaceProduct, getBuyerProfile, getFarmerProfile, getIndianLocations, getMarketplaceProducts, getMyMarketplaceProducts, updateMarketplaceProduct } from '../services/api';
import { getUserRole } from '../utils/auth';

const emptyForm = {
  category: 'livestock', animalType: '', weightKg: '', description: '', price: '', state: '', district: '',
  address: '', pincode: '', contactPhone: '', breed: '', age: '', gender: 'unknown', milkYieldPerDay: '',
  healthDetails: '', status: 'available',
};
const emptyFilters = { state: '', district: '', page: 1 };

function getImageCandidates(url) {
  try {
    const imageUrl = new URL(url);
    if (imageUrl.hostname === 'localhost' || imageUrl.hostname === '127.0.0.1') {
      const originalHost = imageUrl.hostname;
      const preferredHost = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
      imageUrl.hostname = preferredHost;
      const candidates = [imageUrl.toString()];
      if (preferredHost !== originalHost) {
        imageUrl.hostname = originalHost;
        candidates.push(imageUrl.toString());
      }
      return candidates;
    }
    return [imageUrl.toString()];
  } catch {
    return [url];
  }
}

function MarketplacePage() {
  const role = getUserRole();
  const seller = role === 'farmer';
  const [products, setProducts] = useState([]);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [locations, setLocations] = useState({ states: [], districtsByState: {} });
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadProducts() {
    setLoading(true); setError('');
    try {
      const response = await getMarketplaceProducts(filters);
      setProducts(response.data.products || []); setPagination(response.data.pagination || pagination);
    } catch (err) { setError(err?.response?.data?.message || 'Unable to load marketplace listings.'); }
    finally { setLoading(false); }
  }
  async function loadMine() {
    try { setMine((await getMyMarketplaceProducts()).data || []); } catch { setMine([]); }
  }
  useEffect(() => {
    getIndianLocations().then((response) => setLocations(response.data)).catch(() => setError('Unable to load location options.'));
    const loadProfileLocation = seller ? getFarmerProfile : getBuyerProfile;
    loadProfileLocation().then((response) => {
      const profile = response.data?.profile || {};
      if (seller) {
        setForm((current) => ({
          ...current,
          state: current.state || profile.state || '',
          district: current.district || profile.district || '',
          pincode: current.pincode || profile.pincode || '',
          contactPhone: current.contactPhone || profile.phone || '',
        }));
      } else if (profile.state || profile.district) {
        setFilters((current) => ({
          ...current,
          state: current.state || profile.state || '',
          district: current.district || profile.district || '',
          page: 1,
        }));
      }
    }).catch(() => {});
  }, [seller]);
  useEffect(() => { if (!seller) loadProducts(); }, [filters, seller]);
  useEffect(() => { if (seller) loadMine(); }, [seller]);

  const districts = locations.districtsByState[filters.state] || [];
  const formDistricts = locations.districtsByState[form.state] || [];
  function changeFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, ...(name === 'state' ? { district: '' } : {}), page: 1 }));
  }
  function changeForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value, ...(name === 'state' ? { district: '' } : {}) }));
  }
  function editListing(item) {
    setEditingId(item._id);
    setForm({ ...emptyForm, ...item, ...item.location, ...(item.animalDetails || {}), ...(item.cropDetails || {}) });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  async function submit(event) {
    event.preventDefault(); setNotice(''); setError('');
    if (files.some((file) => !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Images must be JPEG, PNG, JPG, or WEBP files under 5MB each.'); return;
    }
    try {
      const listing = {
        ...form,
        name: form.animalType,
        productType: form.animalType,
        priceType: 'per_animal',
        quantity: 1,
        unit: 'animal',
      };
      const action = editingId ? updateMarketplaceProduct(editingId, listing, files) : createMarketplaceProduct(listing, files);
      await action; setNotice(editingId ? 'Listing updated successfully.' : 'Listing published successfully.');
      setForm(emptyForm); setFiles([]); setEditingId(null); await Promise.all([loadProducts(), loadMine()]);
    } catch (err) { setError(err?.response?.data?.message || 'Unable to save listing.'); }
  }
  async function remove(id) {
    if (!window.confirm('Delete this listing?')) return;
    try { await deleteMarketplaceProduct(id); setNotice('Listing deleted.'); await Promise.all([loadProducts(), loadMine()]); }
    catch (err) { setError(err?.response?.data?.message || 'Unable to delete listing.'); }
  }

  return <div className="space-y-6">
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Local farmer marketplace</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">{seller ? 'Sell your animals' : 'Find animals near you'}</h1>
      <p className="mt-2 text-sm text-slate-600">Search real farmer listings by state and district. Seller contact details stay private until an inquiry is accepted.</p>
    </header>
    {notice ? <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-green-800">{notice}</div> : null}
    {error ? <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-red-700"><span>{error}</span><button type="button" onClick={loadProducts} className="font-semibold underline">Retry</button></div> : null}

    {!seller ? <>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Find available listings</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <select name="state" value={filters.state} onChange={changeFilter} className="rounded-lg border border-slate-300 px-3 py-2"><option value="">All states</option>{locations.states.map((state) => <option key={state}>{state}</option>)}</select>
        <select name="district" value={filters.district} disabled={!filters.state} onChange={changeFilter} className="rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-50"><option value="">All districts</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>
        <div className="flex gap-2"><button type="button" onClick={loadProducts} className="flex-1 rounded-lg bg-emerald-700 px-3 py-2 font-semibold text-white">Search Marketplace</button><button type="button" onClick={() => setFilters(emptyFilters)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700">Clear</button></div>
      </div>
    </section>

    {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading listings...</div> : products.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600"><h2 className="font-semibold text-slate-900">No available listings found in this district yet.</h2><p className="mt-2">Try a different district or broaden your search.</p></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><Link to={`${product._id}`} className="block transition hover:bg-slate-50">{product.images?.[0]?.url ? <img src={getImageCandidates(product.images[0].url)[0]} alt={product.name} onError={(event) => { const candidates = getImageCandidates(product.images[0].url); const nextIndex = Number(event.currentTarget.dataset.imageIndex || 0) + 1; if (nextIndex < candidates.length) { event.currentTarget.dataset.imageIndex = String(nextIndex); event.currentTarget.src = candidates[nextIndex]; } }} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-emerald-50 text-4xl">🌾</div>}<div className="p-4"><div className="flex items-start justify-between gap-2"><h2 className="font-semibold text-slate-900">{product.name}</h2><span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">{product.category}</span></div><p className="mt-2 text-lg font-bold text-emerald-700">₹{product.price} {product.priceType === 'per_animal' ? 'per animal' : `per ${product.unit}`}</p><p className="mt-1 text-sm text-slate-600">{product.quantity} {product.unit} · {product.location.village}, {product.location.district}</p><p className="mt-2 text-xs text-slate-500">{product.location.state} · {new Date(product.createdAt).toLocaleDateString()}</p></div></Link><div className="flex gap-2 p-4 pt-0">{product.seller?.phone ? <a href={`tel:${product.seller.phone}`} className="flex-1 rounded-lg border border-emerald-700 px-3 py-2 text-center text-sm font-semibold text-emerald-700">Call Farmer</a> : <Link to={`${product._id}`} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700">Chat with Farmer</Link>}</div></article>)}</div>}
    {pagination.pages > 1 ? <div className="flex items-center justify-center gap-4"><button type="button" disabled={filters.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><span className="text-sm text-slate-600">Page {pagination.page} of {pagination.pages}</span><button type="button" disabled={filters.page >= pagination.pages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div> : null}
    </> : null}

    {seller ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit listing' : 'Sell on Marketplace'}</h2>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-sm underline">Cancel edit</button> : null}</div>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
        <select name="animalType" required value={form.animalType} onChange={changeForm} className="rounded-lg border border-slate-300 px-3 py-2"><option value="">Select animal</option><option value="Cow">Cow</option><option value="Buffalo">Buffalo</option><option value="Goat">Goat</option><option value="Sheep">Sheep</option><option value="Bull">Bull</option><option value="Other">Other animal</option></select>
        <input name="weightKg" required type="number" min="0.01" step="0.01" value={form.weightKg} onChange={changeForm} placeholder="Weight in KG" className="rounded-lg border border-slate-300 px-3 py-2" />
        <textarea name="description" required minLength="10" value={form.description} onChange={changeForm} placeholder="Description" rows="3" className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" />
        <input name="price" required type="number" min="0.01" step="0.01" value={form.price} onChange={changeForm} placeholder="Asking price" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="contactPhone" required value={form.contactPhone} onChange={changeForm} placeholder="Contact phone number" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="state" required value={form.state} onChange={changeForm} list="marketplace-states" placeholder="State" className="rounded-lg border border-slate-300 px-3 py-2" /><datalist id="marketplace-states">{locations.states.map((state) => <option key={state} value={state} />)}</datalist>
        <select name="district" required value={form.district} onChange={changeForm} disabled={!form.state} className="rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-50"><option value="">Select district</option>{formDistricts.map((district) => <option key={district}>{district}</option>)}</select>
        <textarea name="address" required minLength="5" value={form.address} onChange={changeForm} placeholder="Full address" rows="2" className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" />
        <input name="pincode" required pattern="[1-9][0-9]{5}" value={form.pincode} onChange={changeForm} placeholder="PIN code" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="breed" value={form.breed} onChange={changeForm} placeholder="Breed (optional)" className="rounded-lg border border-slate-300 px-3 py-2" />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Photos (up to 6, max 5MB each)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <p className="mt-1 text-xs text-slate-500">For livestock, add a clear animal photo so buyers can inspect the listing before contacting you.</p>
        </div>
        <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 md:col-span-2">{editingId ? 'Save changes' : 'Publish listing'}</button>
      </form>
      <div className="mt-6"><h3 className="font-semibold text-slate-900">My Listings</h3>{mine.length === 0 ? <p className="mt-2 text-sm text-slate-600">No listings yet.</p> : <div className="divide-y divide-slate-100">{mine.map((item) => <div key={item._id} className="flex items-center justify-between gap-3 py-3"><span><strong>{item.name}</strong><span className="ml-2 text-sm text-slate-500">{item.status} · ₹{item.price}</span></span><span className="flex gap-3"><button type="button" onClick={() => editListing(item)} className="text-sm font-semibold text-emerald-700">Edit</button><button type="button" onClick={() => remove(item._id)} className="text-sm font-semibold text-red-600">Delete</button></span></div>)}</div>}</div>
    </section> : null}
  </div>;
}

export default MarketplacePage;
