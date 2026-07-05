import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
        localStorage.setItem('access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login/', data),
  register:       (data) => api.post('/auth/register/', data),
  logout:         (data) => api.post('/auth/logout/', data),
  getProfile:     ()     => api.get('/auth/profile/'),
  updateProfile:  (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// ── Doctor ────────────────────────────────────────────────────────────
export const doctorAPI = {
  getProfile:    ()     => api.get('/doctors/profile/'),
  createProfile: (data) => api.post('/doctors/profile/', data),
  updateProfile: (data) => api.put('/doctors/profile/', data),
};

// ── Patients ──────────────────────────────────────────────────────────
export const patientAPI = {
  getAll:      (params) => api.get('/patients/', { params }),
  getById:     (id)     => api.get(`/patients/${id}/`),
  create:      (data)   => api.post('/patients/', data),
  update:      (id, data) => api.put(`/patients/${id}/`, data),
  delete:      (id)     => api.delete(`/patients/${id}/`),
  getTimeline: (id)     => api.get(`/patients/${id}/timeline/`),
  getStats:    ()       => api.get('/patients/stats/'),
};

// ── EMR ───────────────────────────────────────────────────────────────
export const emrAPI = {
  getVitals:           (patientId)          => api.get(`/emr/patients/${patientId}/vitals/`),
  addVitals:           (patientId, data)    => api.post(`/emr/patients/${patientId}/vitals/`, data),
  getEncounters:       (patientId)          => api.get(`/emr/patients/${patientId}/encounters/`),
  addEncounter:        (patientId, data)    => api.post(`/emr/patients/${patientId}/encounters/`, data),
  updateEncounter:     (id, data)           => api.put(`/emr/encounters/${id}/`, data),
  deleteEncounter:     (id)                 => api.delete(`/emr/encounters/${id}/`),
  getPrescriptions:    (encounterId)        => api.get(`/emr/encounters/${encounterId}/prescriptions/`),
  addPrescription:     (encounterId, data)  => api.post(`/emr/encounters/${encounterId}/prescriptions/`, data),
  getAllergies:         (patientId)          => api.get(`/emr/patients/${patientId}/allergies/`),
  addAllergy:          (patientId, data)    => api.post(`/emr/patients/${patientId}/allergies/`, data),
  deleteAllergy:       (id)                 => api.delete(`/emr/allergies/${id}/`),
};

// ── Predictions ───────────────────────────────────────────────────────
export const predictionAPI = {
  predict:    (patientId, data) => api.post(`/predictions/predict/${patientId}/`, data),
  getHistory: (patientId)       => api.get(`/predictions/history/${patientId}/`),
  getStats:   ()                => api.get('/predictions/stats/'),
};

// ── Lab Reports ───────────────────────────────────────────────────────
export const labAPI = {
  getAll:    (params) => api.get('/reports/', { params }),
  getById:   (id)     => api.get(`/reports/${id}/`),
  create:    (data)   => api.post('/reports/', data),
  delete:    (id)     => api.delete(`/reports/${id}/`),
  getStats:  ()       => api.get('/reports/stats/'),
};

// ── RAG / AI Assistant ────────────────────────────────────────────────
export const ragAPI = {
  ask:          (data) => api.post('/rag/ask/', data),
  getHistory:   ()     => api.get('/rag/history/'),
  buildIndex:   ()     => api.post('/rag/build-index/'),
};

// ── Discharge Summary ─────────────────────────────────────────────────
export const dischargeAPI = {
  getAll:             (params) => api.get('/discharge/', { params }),
  getById:            (id)     => api.get(`/discharge/${id}/`),
  create:             (data)   => api.post('/discharge/', data),
  update:             (id, data) => api.put(`/discharge/${id}/`, data),
  delete:             (id)     => api.delete(`/discharge/${id}/`),
  generatePDF:        (id)     => api.get(`/discharge/${id}/pdf/`, { responseType: 'blob' }),
  regenerateNarrative:(id)     => api.post(`/discharge/${id}/regenerate/`),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats:         () => api.get('/dashboard/stats/'),
  getActivity:      () => api.get('/dashboard/activity/'),
  getTrends:        () => api.get('/dashboard/trends/'),
  getDiseaseTrends: () => api.get('/dashboard/diseases/'),
  getNotifications: () => api.get('/dashboard/notifications/'),
};

export default api;