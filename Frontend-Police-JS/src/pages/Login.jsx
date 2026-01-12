/* ============================================================================
 * LOGIN PAGE
 * ============================================================================
 * Purpose: Authentication entry point for Police officers.
 * Features:
 * - Email/Password validation
 * - JWT Authentication via Backend
 * - Password visibility toggle
 * - Error feedback
 * Input:
 * - User credentials (email, password)
 * Output:
 * - Auth Context state update (token storage)
 * - Redirection to Dashboard
 * ============================================================================
 */

import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logoV1 from '../assets/logo/logo-v1.png'

const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Form Validation Logic
  // Checks for presence and basic email format
  const validateForm = () => {
    const nextErrors = {}
    
    // Email validation
    if (!email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address'
    }
    
    if (!password.trim()) {
      nextErrors.password = 'Password is required'
    }
    
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  // Handle Login Submission
  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setErrors({})

    // Authenticate with backend
    // Defaults to 'police' role check
    const success = await login(email.trim(), password, 'police')
    
    if (success) {
      // Success case: Navigation handled by useEffect
    } else {
      // Failure case: Show error message
      setErrors({ general: authError || 'Login failed. Please check your credentials.' })
    }

    setSubmitting(false)
  }

  // Loading spinner during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center glass-bg-static">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="bg-white/25 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 space-y-5 border border-white/40">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-white/95 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl ring-2 ring-white/60 hover:scale-105 transition-transform">
                  {/* Logo: swap this import if you want a different version */}
                  <img src={logoV1} alt="CRASH" className="h-full w-full object-cover rounded-full" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white drop-shadow-lg">Police Office</h2>
              <p className="mt-2 text-sm text-white/90 font-medium drop-shadow">Crime Response & Alert System Hub</p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/95 mb-2 drop-shadow">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-white/40 rounded-lg bg-white/30 backdrop-blur-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400/70 focus:border-white/60 focus:bg-white/40 transition-all duration-200 shadow-md font-medium"
                  placeholder="police@crash.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500 drop-shadow" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-100 font-medium drop-shadow">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/95 mb-2 drop-shadow">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border border-white/40 rounded-lg bg-white/30 backdrop-blur-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400/70 focus:border-white/60 focus:bg-white/40 transition-all duration-200 shadow-md font-medium"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/10 rounded-r-lg transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-700 drop-shadow" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-700 drop-shadow" />
                  )}
                </button>
                {errors.password && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500 drop-shadow" />
                  </div>
                )}
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-100 font-medium drop-shadow">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="bg-red-500/30 backdrop-blur-lg border border-red-300/50 rounded-lg p-3 shadow-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-100 mr-2 drop-shadow flex-shrink-0" />
                  <p className="text-sm font-medium text-red-50 drop-shadow">{errors.general}</p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-primary text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] w-full shadow-lg drop-shadow-md"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
