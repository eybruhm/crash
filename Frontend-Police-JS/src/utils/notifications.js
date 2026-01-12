/**
 * New report sound notification helper.
 *
 * Browser autoplay rules:
 * - Most browsers block audio unless the user has interacted with the page.
 * - So we only play sound after the user clicks/taps at least once.
 *
 * How to add a real sound:
 * 1) Create folder: Frontend-Police-JS/public/sounds/
 * 2) Put file: Frontend-Police-JS/public/sounds/new-report.mp3
 * 3) Restart `npm run dev`
 *
 * If you want a different filename, change SOUND_URL below.
 */

const SOUND_URL = '/sounds/new-report.mp3' // <- put your mp3 here (public folder)

let userInteracted = false

export function initUserInteractionForSound() {
  if (userInteracted) return
  
  // Mark user interaction as true as soon as they touch/click/press a key
  const mark = () => {
    userInteracted = true
    // Cleanup listeners once interaction is recorded
    window.removeEventListener('pointerdown', mark)
    window.removeEventListener('keydown', mark)
  }
  
  // Attach one-time listeners
  window.addEventListener('pointerdown', mark, { once: true })
  window.addEventListener('keydown', mark, { once: true })
}

export async function playNewReportSound() {
  // Prevent playback if browser autoplay policy is not satisfied
  if (!userInteracted) return
  try {
    const audio = new Audio(SOUND_URL)
    audio.volume = 1
    await audio.play()
  } catch {
    // Silently fail on error (e.g., file missing, playback blocked) to avoid console noise
  }
}


