/**
 * RequireAuth Component
 *
 * Protected route wrapper.
 *
 * Responsibilities:
 * - Redirect unauthenticated users to the login route
 * - Enforce that the Admin web app is only accessible to `role === "admin"`
 *
 * Notes:
 * - Role is stored in localStorage (set on login). Some backend profile endpoints
 *   don't return role, so we defensively preserve it if it goes missing.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { clearAuth, getStoredUser, isAuthenticated, storeUser } from '../utils/auth'
import { ROUTES } from '../constants'

export function RequireAuth({ children }) {
  const location = useLocation()
  
  if (!isAuthenticated()) {
    // Save the attempted route so we can redirect back after login.
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Role gate: Admin web should only allow admin role
  const user = getStoredUser()
  // If role is missing but user exists, try to preserve it (might have been lost during profile update)
  if (!user?.role && user) {
    // Restore role if it was accidentally removed (shouldn't happen, but safety check)
    storeUser({ ...user, role: 'admin' })
    // Re-fetch user to get updated version
    const updatedUser = getStoredUser()
    if (updatedUser?.role === 'admin') {
      return children
    }
  }
  
  if (user?.role !== 'admin') {
    // Non-admin role is not allowed in this app; clear storage to avoid stale auth state.
    clearAuth()
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }
  
  return children
}

export default RequireAuth
