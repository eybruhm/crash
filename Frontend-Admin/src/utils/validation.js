/**
 * Form Validation Utilities
 *
 * Notes:
 * - These are UI-level checks only (fast feedback).
 * - Backend still enforces the real validation rules.
 */

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneNumber(phone) {
  // Basic phone validation - digits only, 7-15 characters (after stripping separators)
  const phoneRegex = /^[0-9]{7,15}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export function validateCoordinates(lat, lng) {
  // Accept strings from inputs; parse into numbers for range checks.
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
}

export function validatePassword(password) {
  return password && password.length >= 6
}

