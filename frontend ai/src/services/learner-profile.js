const STORAGE_KEY = 'dsa-mentor-learner-profile'
const CHANGE_EVENT = 'dsa-mentor-profile-change'

export function loadLearnerProfile() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const profile = JSON.parse(stored)
    if (typeof profile?.displayName !== 'string' || typeof profile?.learningGoal !== 'string') {
      throw new Error('Saved profile has an invalid shape.')
    }

    return {
      displayName: profile.displayName,
      learningGoal: profile.learningGoal,
      createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : new Date().toISOString(),
    }
  } catch {
    throw new Error('Saved demo profile is unreadable. Clear this site’s profile storage to start fresh.')
  }
}

export function saveLearnerProfile({ displayName, learningGoal }) {
  const normalizedName = String(displayName || '').trim()
  const normalizedGoal = String(learningGoal || '').trim()
  if (!normalizedName || normalizedName.length > 60) {
    throw new Error('Enter a display name between 1 and 60 characters.')
  }
  if (!normalizedGoal || normalizedGoal.length > 120) {
    throw new Error('Enter a learning goal between 1 and 120 characters.')
  }

  const existing = loadLearnerProfile()
  const profile = {
    displayName: normalizedName,
    learningGoal: normalizedGoal,
    createdAt: existing?.createdAt || new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return profile
}

export function clearLearnerProfile() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeToLearnerProfile(onChange) {
  const handleChange = () => onChange()
  window.addEventListener(CHANGE_EVENT, handleChange)
  window.addEventListener('storage', handleChange)

  return () => {
    window.removeEventListener(CHANGE_EVENT, handleChange)
    window.removeEventListener('storage', handleChange)
  }
}
