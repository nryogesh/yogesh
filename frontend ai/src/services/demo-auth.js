const configuredEnvironment = import.meta.env || {}

export const DEMO_CREDENTIALS = Object.freeze({
  userId: configuredEnvironment.VITE_DEMO_USER_ID || 'demo',
  password: configuredEnvironment.VITE_DEMO_PASSWORD || 'Demo@123',
})

export function authenticateDemoUser(userId, password, credentials = DEMO_CREDENTIALS) {
  return typeof userId === 'string'
    && typeof password === 'string'
    && userId.trim() === credentials.userId
    && password === credentials.password
}
