import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFarmRecordById,
  updateFarmRecord,
  uploadFarmImage,
  deleteRecordImage,
  addActivityEntry,
  addFertilizerEntry,
  addDiseaseEntry,
  deleteFarmRecord,
} from '../../services/api';
import ImageUploadComponent from '../../components/ImageUploadComponent';

function FarmRecordDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [formData, setFormData] = useState({
    crop: '',
    cropVariety: '',
    sowingDate: '',
    expectedHarvestDate: '',
    harvestDate: '',
    soilInfo: '',
    notes: '',
  });

  const [newActivity, setNewActivity] = useState({ activity: '', date: '', notes: '' });
  const [newFertilizer, setNewFertilizer] = useState({ name: '', quantity: '', dateApplied: '' });
  const [newDisease, setNewDisease] = useState({ disease: '', dateObserved: '', treatment: '', status: 'suspected' });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  async function fetchRecord() {
    setLoading(true);
    setError('');

    try {
      const result = await getFarmRecordById(id);
      setRecord(result.data);
      setFormData({
        crop: result.data.crop || '',
        cropVariety: result.data.cropVariety || '',
        sowingDate: result.data.sowingDate?.slice(0, 10) || '',
        expectedHarvestDate: result.data.expectedHarvestDate?.slice(0, 10) || '',
        harvestDate: result.data.harvestDate?.slice(0, 10) || '',
        soilInfo: result.data.soilInfo || '',
        notes: result.data.notes || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch farm record.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges() {
    setSaving(true);
    setError('');

    try {
      await updateFarmRecord(id, formData);
      await fetchRecord();
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageSelect(file) {
    setSelectedImage(file);
  }

  async function handleUploadImage() {
    if (!selectedImage) return;

    setImageUploading(true);
    setError('');

    try {
      await uploadFarmImage(id, selectedImage);
      setSelectedImage(null);
      await fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setImageUploading(false);
    }
  }

  async function handleDeleteImage(publicId) {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    setError('');

    try {
      await deleteRecordImage(id, publicId);
      await fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image.');
    }
  }

  async function handleAddActivity() {
    if (!newActivity.activity || !newActivity.date) {
      setError('Activity and date are required.');
      return;
    }

    setError('');

    try {
      await addActivityEntry(id, newActivity);
      setNewActivity({ activity: '', date: '', notes: '' });
      await fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add activity.');
    }
  }

  async function handleAddFertilizer() {
    if (!newFertilizer.name || !newFertilizer.quantity || !newFertilizer.dateApplied) {
      setError('All fertilizer fields are required.');
      return;
    }

    setError('');

    try {
      await addFertilizerEntry(id, newFertilizer);
      setNewFertilizer({ name: '', quantity: '', dateApplied: '' });
      await fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add fertilizer.');
    }
  }

  async function handleAddDisease() {
    if (!newDisease.disease || !newDisease.dateObserved) {
      setError('Disease name and observation date are required.');
      return;
    }

    setError('');

    try {
      await addDiseaseEntry(id, newDisease);
      setNewDisease({ disease: '', dateObserved: '', treatment: '', status: 'suspected' });
      await fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add disease entry.');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this farm record? This action cannot be undone.')) return;

    setError('');

    try {
      await deleteFarmRecord(id);
      navigate('/farmer/farm-records');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete farm record.');
    }
  }

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">Loading...</div>;
  }

  if (!record) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">Record not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {record.crop}
            {record.cropVariety && ` (${record.cropVariety})`}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sown: {new Date(record.sowingDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-300 bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        {['details', 'images', 'activities', 'fertilizers', 'diseases'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'border-b-2 border-leaf text-leaf'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          {editMode ? (
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Crop Name</label>
                  <input
                    type="text"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Crop Variety</label>
                  <input
                    type="text"
                    value={formData.cropVariety}
                    onChange={(e) => setFormData({ ...formData, cropVariety: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Sowing Date</label>
                  <input
                    type="date"
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Expected Harvest Date</label>
                  <input
                    type="date"
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Harvest Date</label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Soil Information</label>
                <textarea
                  value={formData.soilInfo}
                  onChange={(e) => setFormData({ ...formData, soilInfo: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  rows={3}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="rounded-md bg-leaf px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">Sowing Date</p>
                  <p className="mt-1 text-base text-slate-900">{new Date(record.sowingDate).toLocaleDateString()}</p>
                </div>
                {record.expectedHarvestDate && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Expected Harvest Date</p>
                    <p className="mt-1 text-base text-slate-900">{new Date(record.expectedHarvestDate).toLocaleDateString()}</p>
                  </div>
                )}
                {record.harvestDate && (
                  <div>
                    <p className="text-sm font-medium text-slate-600">Harvest Date</p>
                    <p className="mt-1 text-base text-slate-900">{new Date(record.harvestDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {record.soilInfo && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Soil Information</p>
                  <p className="mt-1 text-base text-slate-900">{record.soilInfo}</p>
                </div>
              )}

              {record.notes && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Notes</p>
                  <p className="mt-1 text-base text-slate-900">{record.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'images' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Upload Image</h3>
            <ImageUploadComponent
              onImageSelect={handleImageSelect}
              isUploading={imageUploading}
            />
            {selectedImage && (
              <button
                onClick={handleUploadImage}
                disabled={imageUploading}
                className="mt-4 rounded-md bg-leaf px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {imageUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            )}
          </div>

          {record.images && record.images.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Images ({record.images.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {record.images.map((image) => (
                  <div key={image.publicId} className="relative">
                    <img
                      src={image.url}
                      alt="Farm record"
                      className="h-48 w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => handleDeleteImage(image.publicId)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Add Activity</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Activity</label>
                <input
                  type="text"
                  value={newActivity.activity}
                  onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  placeholder="e.g., Applied fertilizer, Pruned branches"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  rows={2}
                />
              </div>
              <button
                onClick={handleAddActivity}
                className="rounded-md bg-leaf px-4 py-2 font-semibold text-white hover:bg-green-700"
              >
                Add Activity
              </button>
            </div>
          </div>

          {record.farmingActivities && record.farmingActivities.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Activities ({record.farmingActivities.length})
              </h3>
              <div className="space-y-3">
                {record.farmingActivities.map((activity, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-3 last:border-0">
                    <p className="font-medium text-slate-900">{activity.activity}</p>
                    <p className="text-xs text-slate-500">{new Date(activity.date).toLocaleDateString()}</p>
                    {activity.notes && <p className="mt-1 text-sm text-slate-600">{activity.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'fertilizers' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Add Fertilizer</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fertilizer Name</label>
                <input
                  type="text"
                  value={newFertilizer.name}
                  onChange={(e) => setNewFertilizer({ ...newFertilizer, name: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  placeholder="e.g., NPK 10-10-10"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Quantity</label>
                <input
                  type="text"
                  value={newFertilizer.quantity}
                  onChange={(e) => setNewFertilizer({ ...newFertilizer, quantity: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  placeholder="e.g., 10 kg"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Date Applied</label>
                <input
                  type="date"
                  value={newFertilizer.dateApplied}
                  onChange={(e) => setNewFertilizer({ ...newFertilizer, dateApplied: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                />
              </div>
              <button
                onClick={handleAddFertilizer}
                className="rounded-md bg-leaf px-4 py-2 font-semibold text-white hover:bg-green-700"
              >
                Add Fertilizer
              </button>
            </div>
          </div>

          {record.fertilizersUsed && record.fertilizersUsed.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Fertilizers ({record.fertilizersUsed.length})
              </h3>
              <div className="space-y-3">
                {record.fertilizersUsed.map((fert, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-3 last:border-0">
                    <p className="font-medium text-slate-900">{fert.name}</p>
                    <p className="text-sm text-slate-600">Quantity: {fert.quantity}</p>
                    <p className="text-xs text-slate-500">{new Date(fert.dateApplied).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'diseases' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Add Disease Record</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Disease Name</label>
                <input
                  type="text"
                  value={newDisease.disease}
                  onChange={(e) => setNewDisease({ ...newDisease, disease: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  placeholder="e.g., Early Blight, Powdery Mildew"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Date Observed</label>
                <input
                  type="date"
                  value={newDisease.dateObserved}
                  onChange={(e) => setNewDisease({ ...newDisease, dateObserved: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Treatment Applied</label>
                <input
                  type="text"
                  value={newDisease.treatment}
                  onChange={(e) => setNewDisease({ ...newDisease, treatment: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                  placeholder="e.g., Applied neem oil"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={newDisease.status}
                  onChange={(e) => setNewDisease({ ...newDisease, status: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-leaf focus:ring"
                >
                  <option value="suspected">Suspected</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="treated">Treated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <button
                onClick={handleAddDisease}
                className="rounded-md bg-leaf px-4 py-2 font-semibold text-white hover:bg-green-700"
              >
                Add Disease Record
              </button>
            </div>
          </div>

          {record.diseaseHistory && record.diseaseHistory.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Disease History ({record.diseaseHistory.length})
              </h3>
              <div className="space-y-3">
                {record.diseaseHistory.map((disease, idx) => (
                  <div key={idx} className="border-b border-slate-200 pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{disease.disease}</p>
                        <p className="text-xs text-slate-500">{new Date(disease.dateObserved).toLocaleDateString()}</p>
                        {disease.treatment && (
                          <p className="mt-1 text-sm text-slate-600">Treatment: {disease.treatment}</p>
                        )}
                      </div>
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        disease.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : disease.status === 'treated'
                          ? 'bg-blue-100 text-blue-800'
                          : disease.status === 'confirmed'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {disease.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FarmRecordDetailsPage;
