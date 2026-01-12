/**
 * API Service Layer
 * 
 * Centralized Axios configuration for all API calls to the Django backend.
 * Handles:
 * - Base URL configuration
 * - JWT token attachment to requests
 * - Request/response interceptors
 * - Token refresh logic
 */

import axios from 'axios';

// Base URL for Django backend (dev + production via env)
// Example .env:
// VITE_API_BASE_URL=http://localhost:8000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Request Interceptor
 * Automatically attaches JWT access token to every request (if available)
 */
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve access token from persistent storage
    const accessToken = localStorage.getItem('access_token');
    
    // If token exists, inject into headers to authenticate request
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token expiration and automatic refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Pass through successful responses without modification
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh logic for auth-specific endpoints
    // This prevents infinite loops if login/refresh fails with 401
    const url = originalRequest?.url || '';
    if (url.includes('/auth/login/') || url.includes('/auth/refresh/')) {
      return Promise.reject(error);
    }
    
    // Detect 401 Unauthorized errors indicating expired access token
    // Identify if this request has already been retried to avoid loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the session using the refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call backend to get a fresh access token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        
        // Commit new access token to storage for future requests
        localStorage.setItem('access_token', access);
        
        // Retry the original failed request with the new valid token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Critical failure: Refresh token is also invalid or expired
        // Clean up stale session data and force user to re-login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Force navigation to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
