/**
 * Frontend-Admin shared constants
 *
 * Keep these in one place so routes/storage keys stay consistent across:
 * - route guards (`components/RequireAuth.jsx`)
 * - API client (`services/apiClient.js`)
 * - auth utilities (`utils/auth.js`)
 */

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  POLICE_ACCOUNTS: '/police-accounts',
  PROFILE: '/profile',
  MANUAL_REPORT: '/manual-report',
  PASSWORD_HASH_CONVERTER: '/password-hash-converter',
}

export const STORAGE_KEYS = {
  // Stores the admin user payload returned by backend login.
  ADMIN_USER: 'crash_admin_user',

  // Stores JWT access token (used for Authorization header).
  ADMIN_TOKEN: 'crash_admin_token',

  // Stores JWT refresh token (used to recover when access token expires).
  ADMIN_REFRESH: 'crash_admin_refresh_token',
}

// Backend base URL.
// Typical local dev: http://localhost:8000/api
// Preferred format for this app: http://127.0.0.1:8000/api/v1
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Google Maps JS API key (used by map + reverse geocode helpers)
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
