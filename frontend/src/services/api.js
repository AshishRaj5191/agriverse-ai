import axios from 'axios';
import { clearAuthSession } from '../utils/auth';

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      clearAuthSession();
    }
    return Promise.reject(error);
  }
);

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

export async function getIndianLocations() {
  const response = await api.get('/locations');
  return response.data;
}

export async function getFarmerProfile() {
  const response = await api.get('/farmers/profile');
  return response.data;
}

export async function getBuyerProfile() {
  const response = await api.get('/buyers/profile');
  return response.data;
}

export async function getVerifiedExperts(filters = {}) {
  const response = await api.get('/farmers/experts', { params: filters });
  return response.data;
}

export async function updateExpertVerification(profileId, verificationStatus) {
  const response = await api.patch(`/admin/experts/${profileId}/verification`, {
    verificationStatus,
  });
  return response.data;
}

export async function getGovernmentSchemes(filters = {}) {
  const response = await api.get('/government-schemes', { params: filters });
  return response.data;
}

export async function getGovernmentSchemeById(id) {
  const response = await api.get(`/government-schemes/${id}`);
  return response.data;
}

export async function createGovernmentScheme(payload) {
  const response = await api.post('/admin/government-schemes', payload);
  return response.data;
}

export async function updateGovernmentScheme(id, payload) {
  const response = await api.patch(`/admin/government-schemes/${id}`, payload);
  return response.data;
}

export async function deleteGovernmentScheme(id) {
  const response = await api.delete(`/admin/government-schemes/${id}`);
  return response.data;
}

export async function createConsultation(payload, images = []) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value ?? ''));
  images.forEach((image) => formData.append('images', image));
  const response = await api.post('/consultations', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
}

export async function getFarmerConsultations() {
  const response = await api.get('/consultations/farmer');
  return response.data;
}

export async function getExpertConsultations() {
  const response = await api.get('/consultations/expert');
  return response.data;
}

export async function getConsultation(id) {
  const response = await api.get(`/consultations/${id}`);
  return response.data;
}

export async function respondToConsultation(id, payload) {
  const response = await api.patch(`/consultations/${id}/respond`, payload);
  return response.data;
}

export async function acceptConsultation(id) {
  const response = await api.patch(`/consultations/${id}/accept`);
  return response.data;
}

export async function declineConsultation(id) {
  const response = await api.patch(`/consultations/${id}/decline`);
  return response.data;
}

export async function getConsultationMessages(id) {
  const response = await api.get(`/consultations/${id}/messages`);
  return response.data;
}

export async function sendConsultationMessage(id, message) {
  const response = await api.post(`/consultations/${id}/messages`, { message });
  return response.data;
}

export async function getNotifications() {
  const response = await api.get('/notifications');
  return response.data;
}

export async function markNotificationRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}

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

export async function processVoiceQuestion(payload) {
  const response = await api.post('/voice/process', payload);
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

export async function getWeather(location) {
  const response = await api.get('/weather', { params: { city: location } });
  return response.data;
}

export async function recommendCrops(payload) {
  const response = await api.post('/recommendations/crops', payload);
  return response.data;
}

export async function recommendFertilizer(payload) {
  const response = await api.post('/recommendations/fertilizer', payload);
  return response.data;
}

export async function getMarketplaceProducts(params = {}) {
  const response = await api.get('/marketplace', { params });
  return response.data;
}

export async function getMarketplaceProduct(id) {
  const response = await api.get(`/marketplace/${id}`);
  return response.data;
}

export async function getMyMarketplaceProducts() {
  const response = await api.get('/marketplace/seller/mine');
  return response.data;
}

export async function createMarketplaceProduct(payload, images = []) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value ?? ''));
  images.forEach((image) => formData.append('images', image));
  const response = await api.post('/marketplace', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
}

export async function updateMarketplaceProduct(id, payload, images = []) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value ?? ''));
  images.forEach((image) => formData.append('images', image));
  const response = await api.put(`/marketplace/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
}

export async function deleteMarketplaceProduct(id) {
  const response = await api.delete(`/marketplace/${id}`);
  return response.data;
}

export async function contactMarketplaceSeller(id, message) {
  const response = await api.post(`/marketplace/${id}/inquiries`, { message });
  return response.data;
}

export async function startMarketplaceConversation(listingId) {
  const response = await api.post('/marketplace/conversations', { listingId });
  return response.data;
}

export async function getMarketplaceConversations() {
  const response = await api.get('/marketplace/conversations');
  return response.data;
}

export async function getMarketplaceMessages(conversationId) {
  const response = await api.get(`/marketplace/conversations/${conversationId}/messages`);
  return response.data;
}

export async function sendMarketplaceMessage(conversationId, message) {
  const response = await api.post(`/marketplace/conversations/${conversationId}/messages`, { message });
  return response.data;
}

export default api;
