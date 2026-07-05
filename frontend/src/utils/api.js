/**
 * utils/api.js — Axios instance configured for the Employee Feedback Agent backend
 *
 * Features:
 *  - Base URL from environment or proxy
 *  - Attaches JWT access token to every request
 *  - Auto-refreshes token on 401 TOKEN_EXPIRED (not on login/refresh routes)
 *  - Stores accessToken in memory (not localStorage) for security
 */

import axios from 'axios';

// ─── In-memory token store (XSS-safer than localStorage) ──────────────────────
let accessToken = null;
export const setAccessToken  = (token) => { accessToken = token; };
export const getAccessToken  = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };

// ─── Axios instance ────────────────────────────────────────────────────────────
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,            // Include httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,                   // 10 s — surfaces network errors quickly
});

// ─── Separate instance for token refresh (no interceptor loop) ──────────────────
const refreshApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
});

// ─── Request interceptor: Attach Bearer token ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Routes that should NEVER trigger the refresh/redirect logic ───────────────
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];

const isAuthRoute = (url = '') =>
  AUTH_ROUTES.some((r) => url.includes(r));

// ─── Response interceptor: Handle token refresh ────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── Only attempt token refresh for authenticated endpoints ──────────────
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshApi.post(
          '/auth/refresh', {}, { withCredentials: true }
        );
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();

        // ── Only redirect if NOT already on the login page ──────────────
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API helper functions ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  // Use a fresh axios instance for refresh so it bypasses the interceptor above
  refresh:  ()     => refreshApi.post('/auth/refresh', {}, { withCredentials: true }),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
};

export const feedbackAPI = {
  submit: (data)     => api.post('/feedback', data),
  list:   (params)   => api.get('/feedback', { params }),
  get:    (id)       => api.get(`/feedback/${id}`),
  update: (id, data) => api.patch(`/feedback/${id}`, data),
};

export const dashboardAPI = {
  sentimentTrends: (params) => api.get('/dashboard/sentiment-trends', { params }),
  themes:          (params) => api.get('/dashboard/themes', { params }),
  urgent:          (params) => api.get('/dashboard/urgent', { params }),
  overview:        (params) => api.get('/dashboard/overview', { params }),
};

export const settingsAPI = {
  get:    (params) => api.get('/settings', { params }),
  update: (data)   => api.patch('/settings', data),
};

export default api;
