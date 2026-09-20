import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agriverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

// Farm Records API
export async function createFarmRecord(payload) {
  const response = await api.post('/farmers/farm-records', payload);
  return response.data;
}

export async function getFarmRecords(skip = 0, limit = 10) {
  const response = await api.get('/farmers/farm-records', {
    params: { skip, limit },
  });
  return response.data;
}

export async function getFarmRecordById(id) {
  const response = await api.get(`/farmers/farm-records/${id}`);
  return response.data;
}

export async function updateFarmRecord(id, payload) {
  const response = await api.put(`/farmers/farm-records/${id}`, payload);
  return response.data;
}

export async function deleteFarmRecord(id) {
  const response = await api.delete(`/farmers/farm-records/${id}`);
  return response.data;
}

export async function uploadFarmImage(recordId, file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/farmers/farm-records/${recordId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function deleteRecordImage(recordId, imagePublicId) {
  const encodedPublicId = encodeURIComponent(imagePublicId);
  const response = await api.delete(
    `/farmers/farm-records/${recordId}/images/${encodedPublicId}`
  );
  return response.data;
}

// AI Disease Prediction API
export async function predictDisease(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/ai/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function addFertilizerEntry(recordId, payload) {
  const response = await api.post(`/farmers/farm-records/${recordId}/fertilizers`, payload);
  return response.data;
}

export async function addActivityEntry(recordId, payload) {
  const response = await api.post(`/farmers/farm-records/${recordId}/activities`, payload);
  return response.data;
}

export async function addDiseaseEntry(recordId, payload) {
  const response = await api.post(`/farmers/farm-records/${recordId}/diseases`, payload);
  return response.data;
}

export default api;
