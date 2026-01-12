/**
 * Admin API Client (Axios)
 *
 * Responsibilities:
 * - Uses VITE_API_BASE_URL (example: http://127.0.0.1:8000/api/v1)
 * - Attaches JWT access token from localStorage
 * - Handles access token expiry automatically:
 *   - On 401, attempts refresh via POST /auth/refresh/
 *   - Replays the original request once with the new access token
 *   - If refresh fails (or refresh token missing), clears auth and redirects to /login
 *
 * Notes:
 * - `/auth/login/` and `/auth/refresh/` are excluded from auto-redirect so the UI can show errors.
 * - Uses a shared `refreshPromise` so multiple 401s trigger only ONE refresh request.
 */
import axios from 'axios'
import { STORAGE_KEYS } from '../constants'
import { clearAuth, getStoredRefreshToken, getStoredToken, storeToken } from '../utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      // Always attach access token if present (backend expects Authorization: Bearer <token>)
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Shared refresh promise to prevent a refresh request stampede.
// If 5 requests fail with 401 at the same time, they all await the SAME refresh request.
let refreshPromise = null

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config
    const url = originalRequest?.url || ''

    // If login fails, do not auto-redirect (let UI show the error)
    if (url.includes('/auth/login/') || url.includes('/auth/refresh/')) {
      return Promise.reject(error)
    }

    // Attempt refresh once per request (avoid infinite loops)
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      const refresh = getStoredRefreshToken()
      if (refresh) {
        try {
          if (!refreshPromise) {
            // Start one refresh request and share it with all callers.
            refreshPromise = axios
              .post(`${API_BASE_URL}/auth/refresh/`, { refresh })
              .then((res) => {
                const access = res?.data?.access
                if (!access) {
                  throw new Error('Refresh succeeded but no access token returned.')
                }
                // Persist new access token so subsequent requests reuse it.
                storeToken(access)
                return access
              })
              .finally(() => {
                refreshPromise = null
              })
          }

          const newAccess = await refreshPromise
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newAccess}`

          // Replay the original request with the refreshed token.
          return apiClient(originalRequest)
        } catch (refreshErr) {
          // Refresh failed: force logout to avoid leaving the UI in a broken auth state.
          clearAuth()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshErr)
        }
      }

      // No refresh token → force logout
      clearAuth()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient


