import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Use VITE_API_URL in production, fallback to relative path / proxy in dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Map ticketId to id for backward compatibility with existing frontend views
const formatIncident = (incident) => {
  if (incident) {
    incident.id = incident.ticketId;
  }
  return incident;
};

// Auth endpoints
export const loginUserApi = async (email, password) => {
  const res = await api.post('/api/auth/login', { email, password });
  return res.data;
};

export const registerUserApi = async (name, email, password, phone) => {
  const res = await api.post('/api/auth/register', { name, email, password, phone });
  return res.data;
};

export const loginAdminApi = async (email, password) => {
  const res = await api.post('/api/auth/login-admin', { email, password });
  return res.data;
};

export const googleLoginApi = async (credential, bypassEmail) => {
  const res = await api.post('/api/auth/google-login', { credential, bypassEmail });
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
};

export const updateProfileApi = async (profileData) => {
  const res = await api.put('/api/auth/update-profile', profileData);
  return res.data;
};

// Incidents / ServiceRequests endpoints
export const getActiveIncidentApi = async () => {
  const res = await api.get('/api/incidents/active');
  if (res.data && res.data.data) {
    res.data.data = formatIncident(res.data.data);
  }
  return res.data;
};

export const createIncidentApi = async (type, issue, loc, reqType, latitude, longitude) => {
  const res = await api.post('/api/incidents', { type, issue, loc, reqType, latitude, longitude });
  if (res.data && res.data.data) {
    res.data.data = formatIncident(res.data.data);
  }
  return res.data;
};

export const getAllIncidentsApi = async (all = false) => {
  const url = all ? '/api/incidents?all=true' : '/api/incidents';
  const res = await api.get(url);
  if (res.data && res.data.data) {
    res.data.data = res.data.data.map(formatIncident);
  }
  return res.data;
};

export const assignIncidentApi = async (ticketId, mechanicId) => {
  const res = await api.put(`/api/incidents/${ticketId}/assign`, { mechanicId });
  if (res.data && res.data.data) {
    res.data.data = formatIncident(res.data.data);
  }
  return res.data;
};

export const getMechanicsApi = async () => {
  const res = await api.get('/api/mechanics');
  return res.data;
};

export const completeIncidentApi = async (ticketId) => {
  const res = await api.put(`/api/incidents/${ticketId}/complete`);
  if (res.data && res.data.data) {
    res.data.data = formatIncident(res.data.data);
  }
  return res.data;
};

export const cancelIncidentApi = async (ticketId) => {
  const res = await api.put(`/api/incidents/${ticketId}/cancel`);
  if (res.data && res.data.data) {
    res.data.data = formatIncident(res.data.data);
  }
  return res.data;
};

export const addChatMessageApi = async (ticketId, sender, text) => {
  const res = await api.post(`/api/incidents/${ticketId}/chat`, { sender, text });
  if (res.data && res.data.data) {
    res.data.data = formatIncident(res.data.data);
  }
  return res.data;
};

// Emergency Reports
export const submitEmergencyReportApi = async (reportData) => {
  const res = await api.post('/api/emergency-reports', reportData);
  return res.data;
};

// Payments
export const getPaymentsApi = async () => {
  const res = await api.get('/api/payments');
  return res.data;
};

// Vehicles
export const getVehiclesApi = async () => {
  const res = await api.get('/api/vehicles');
  return res.data;
};

export const addVehicleApi = async (vehicleData) => {
  const res = await api.post('/api/vehicles', vehicleData);
  return res.data;
};

// Reviews
export const getReviewsApi = async () => {
  const res = await api.get('/api/reviews');
  return res.data;
};

export const createReviewApi = async (reviewData) => {
  const res = await api.post('/api/reviews', reviewData);
  return res.data;
};

// Notifications
export const getNotificationsApi = async () => {
  const res = await api.get('/api/notifications');
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await api.put(`/api/notifications/${id}/read`);
  return res.data;
};

// Incident Stats
export const getAdminStatsApi = async () => {
  const res = await api.get('/api/incidents/stats/admin');
  return res.data;
};

export const getClientStatsApi = async () => {
  const res = await api.get('/api/incidents/stats/client');
  return res.data;
};

// Administrative Actions
export const getUsersApi = async () => {
  const res = await api.get('/api/auth/users');
  return res.data;
};

export const toggleBlockUserApi = async (id) => {
  const res = await api.put(`/api/auth/users/${id}/block`);
  return res.data;
};

export const deleteUserApi = async (id) => {
  const res = await api.delete(`/api/auth/users/${id}`);
  return res.data;
};

export const deleteDriverApi = async (id) => {
  const res = await api.delete(`/api/auth/drivers/${id}`);
  return res.data;
};

export const purgeSystemDataApi = async () => {
  const res = await api.delete('/api/auth/system/purge');
  return res.data;
};

export default api;
