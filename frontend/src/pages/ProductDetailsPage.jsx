import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contactMarketplaceSeller, getMarketplaceProduct, startMarketplaceConversation } from '../services/api';

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

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMarketplaceProduct(id).then((response) => setProduct(response.data)).catch((err) => setError(err?.response?.data?.message || 'Unable to load this listing.'));
  }, [id]);

  async function contactSeller(event) {
    event.preventDefault(); setStatus(''); setError('');
    try { await contactMarketplaceSeller(id, message); setMessage(''); setStatus('Inquiry sent securely to the seller.'); }
    catch (err) { setError(err?.response?.data?.message || 'Unable to send inquiry.'); }
  }

  async function openChat() {
    try {
      await startMarketplaceConversation(id);
      window.location.href = `${window.location.pathname.split('/marketplace/')[0]}/messages`;
    } catch (err) { setError(err?.response?.data?.message || 'Unable to start chat.'); }
  }

  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  if (!product) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Loading listing...</div>;
  return <div className="mx-auto max-w-4xl space-y-5">
    <Link to=".." relative="path" className="text-sm font-medium text-emerald-700">← Back to marketplace</Link>
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      <div>{product.images?.length ? <div className="grid gap-3 sm:grid-cols-2">{product.images.map((image) => <img key={image.publicId} src={getImageCandidates(image.url)[0]} alt={product.name} onError={(event) => { const candidates = getImageCandidates(image.url); const nextIndex = Number(event.currentTarget.dataset.imageIndex || 0) + 1; if (nextIndex < candidates.length) { event.currentTarget.dataset.imageIndex = String(nextIndex); event.currentTarget.src = candidates[nextIndex]; } }} className="h-48 w-full rounded-xl object-cover" />)}</div> : <div className="flex h-64 items-center justify-center rounded-xl bg-emerald-50 text-6xl">🌾</div>}</div>
      <div><span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Animal · {product.status}</span><h1 className="mt-3 text-3xl font-bold text-slate-900">{product.name}</h1><p className="mt-3 text-2xl font-bold text-emerald-700">₹{product.price}</p><p className="mt-2 text-slate-600">State: {product.location?.state} · District: {product.location?.district} · PIN: {product.location?.pincode}</p>{product.location?.address ? <p className="mt-1 text-sm text-slate-600">Address: {product.location.address}</p> : null}{product.animalDetails?.animalType ? <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm"><div><dt className="text-slate-500">Animal</dt><dd className="font-semibold">{product.animalDetails.animalType}</dd></div><div><dt className="text-slate-500">Weight</dt><dd className="font-semibold">{product.animalDetails.weightKg || 'Not specified'} kg</dd></div><div><dt className="text-slate-500">Breed</dt><dd className="font-semibold">{product.animalDetails.breed || 'Not specified'}</dd></div><div><dt className="text-slate-500">Age</dt><dd className="font-semibold">{product.animalDetails.age ?? 'Not specified'}</dd></div></dl> : null}<p className="mt-5 whitespace-pre-wrap text-slate-700">{product.description}</p><div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><h2 className="font-semibold text-slate-900">Contact Farmer</h2><p className="mt-1 text-sm text-slate-600">Seller: {product.seller?.name || 'Verified farmer'}</p>{product.seller?.phone ? <a href={`tel:${product.seller.phone}`} className="mt-3 inline-flex w-full justify-center rounded-lg border border-emerald-700 bg-white px-4 py-3 font-semibold text-emerald-700">Call Farmer</a> : <p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-600">Phone number is private. Use secure chat or send an inquiry.</p>}<button type="button" onClick={openChat} className="mt-3 w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white">Chat / Message Farmer</button><form onSubmit={contactSeller} className="mt-4 space-y-2"><textarea required minLength="3" maxLength="2000" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about price, animal health, pickup, or availability..." rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><button type="submit" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700">Send inquiry</button></form>{status ? <p className="mt-2 text-sm text-green-700">{status}</p> : null}</div></div>
    </div>
  </div>;
}

export default ProductDetailsPage;
