const STORAGE_KEY = 'dsa-mentor-learner-profile'
const CHANGE_EVENT = 'dsa-mentor-profile-change'

export const DEFAULT_DEMO_PROFILE = {
  id: 'demo-learner-01',
  displayName: 'Alex Rivers',
  email: 'alex.rivers@demo.mentor.ai',
  avatarInitials: 'AR',
  avatarGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
  learningGoal: 'Master Java Data Structures & Algorithms for Technical Interviews',
  level: 'Beginner Learner',
  targetCompany: 'Google, Amazon, Meta',
  badge: 'Java Knight 🛡️',
  xp: 0,
  streak: 0,
  solvedCount: 0,
  attemptedCount: 0,
  accuracy: null,
  createdAt: '2026-11-01T08:00:00.000Z',
  isDemo: true,
  sampleActivity: [],
  realActivity: [],
}

export function loadLearnerProfile() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const profile = JSON.parse(stored)
    if (!profile || typeof profile !== 'object' || profile.authenticated !== true) return null

    return {
      ...DEFAULT_DEMO_PROFILE,
      ...profile,
      displayName: typeof profile.displayName === 'string' && profile.displayName.trim() ? profile.displayName : DEFAULT_DEMO_PROFILE.displayName,
      learningGoal: typeof profile.learningGoal === 'string' && profile.learningGoal.trim() ? profile.learningGoal : DEFAULT_DEMO_PROFILE.learningGoal,
      level: typeof profile.level === 'string' ? profile.level : DEFAULT_DEMO_PROFILE.level,
      createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : DEFAULT_DEMO_PROFILE.createdAt,
      realActivity: Array.isArray(profile.realActivity) ? profile.realActivity : [],
      sampleActivity: Array.isArray(profile.sampleActivity) ? profile.sampleActivity : DEFAULT_DEMO_PROFILE.sampleActivity,
    }
  } catch {
    return null
  }
}

export function saveLearnerProfile(updates = {}) {
  const existing = loadLearnerProfile() || DEFAULT_DEMO_PROFILE
  const normalizedName = String(updates.displayName ?? existing.displayName).trim()
  const normalizedGoal = String(updates.learningGoal ?? existing.learningGoal).trim()
  if (!normalizedName) throw new Error('A display name is required.')
  if (normalizedName.length > 60) throw new Error('Display name must be 60 characters or fewer.')
  if (!normalizedGoal) throw new Error('A learning goal is required.')
  if (normalizedGoal.length > 120) throw new Error('Learning goal must be 120 characters or fewer.')

  const profile = {
    ...existing,
    ...updates,
    authenticated: true,
    displayName: normalizedName || DEFAULT_DEMO_PROFILE.displayName,
    learningGoal: normalizedGoal || DEFAULT_DEMO_PROFILE.learningGoal,
    avatarInitials: (normalizedName || DEFAULT_DEMO_PROFILE.displayName)
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return profile
}

export function createDefaultDemoProfile(customName = 'Alex Rivers') {
  const profile = {
    ...DEFAULT_DEMO_PROFILE,
    authenticated: true,
    displayName: customName,
    avatarInitials: customName.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new Event(CHANGE_EVENT))
  return profile
}

export function recordUserActivity({ type, id, title, topic, status = 'passed' }) {
  const profile = loadLearnerProfile() || createDefaultDemoProfile()
  const newEntry = {
    id: `${id}-${Date.now()}`,
    type,
    title,
    topic,
    status,
    at: new Date().toISOString(),
    isSample: false,
  }

  const realActivity = [newEntry, ...(profile.realActivity || [])].slice(0, 50)
  const solvedDelta = type === 'assignment-passed' ? 1 : 0
  const attemptedDelta = type === 'assignment-passed' || type === 'assignment-failed' ? 1 : 0

  return saveLearnerProfile({
    realActivity,
    solvedCount: (profile.solvedCount || 0) + solvedDelta,
    attemptedCount: (profile.attemptedCount || 0) + attemptedDelta,
    xp: (profile.xp ?? 0) + (status === 'passed' ? 50 : 10),
  })
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
