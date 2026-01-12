/* ============================================================================
 * GLOBAL REPORT NOTIFIER
 * ============================================================================
 * Purpose: Background audio notification system for new incidents.
 * Features:
 * - Polls backend for active reports every 15s
 * - Compares current IDs vs previous IDs to detect new items
 * - Plays alert sound when count increases
 * Implementation:
 * - Uses a ref to track IDs without triggering re-renders
 * - Synchronized with Dashboard polling interval
 * ============================================================================
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getMapData, mapReportToMarker } from '../services/mapService'
import { initUserInteractionForSound, playNewReportSound } from '../utils/notifications'
import { POLLING_INTERVALS } from '../constants'

export default function GlobalReportNotifier() {
  const { isAuthenticated } = useAuth()

  // Track the last set of report IDs to detect changes
  const lastIdsRef = useRef(new Set())
  const didInitRef = useRef(false)

  // Initialize audio context on mount (requires user interaction policies)
  useEffect(() => {
    initUserInteractionForSound()
  }, [])

  // Poll for updates when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      lastIdsRef.current = new Set()
      didInitRef.current = false
      return
    }

    let cancelled = false
    let interval = null

    // Polling function
    async function poll() {
      try {
        // Fetch current active reports
        const data = await getMapData({ scopeReports: 'our_office' })
        const reports = (data.active_reports || []).map(mapReportToMarker)
        const nextIds = new Set(reports.map((r) => r.id))

        // Check for new IDs if this isn't the first load
        if (didInitRef.current) {
          let hasNew = false
          nextIds.forEach((id) => {
            if (!lastIdsRef.current.has(id)) hasNew = true
          })
          if (hasNew) {
            playNewReportSound()
          }
        }

        // Update tracking refs
        lastIdsRef.current = nextIds
        didInitRef.current = true
      } catch {
        // Silently ignore polling errors (network glitches, etc.)
      }
    }

    // Execute immediately and then on interval
    poll()
    interval = setInterval(poll, POLLING_INTERVALS.GLOBAL_NOTIFIER_AND_DASHBOARD)

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
      // silence unused variable warning
      void cancelled
    }
  }, [isAuthenticated])

  // This component has no visual output
  return null
}


