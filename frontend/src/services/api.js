import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  search: (params) => api.get('/jobs/search', { params }),
  nearby: (params) => api.get('/jobs/nearby', { params }),
  create: (data) => api.post('/jobs', data),
};

export const applicationsAPI = {
  apply: (jobId, data) => api.post(`/applications/apply/${jobId}`, data),
  getMy: () => api.get('/applications/my-applications'),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  create: (data) => api.post('/profile', data),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard/seeker'),
  getEmployer: () => api.get('/dashboard/employer'),
  getAdmin: () => api.get('/dashboard/platform'),
};

export default api;
