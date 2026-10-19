export class ProblemInputError extends Error {}

function normalizeText(value, field, fallback, maxLength) {
  if (value === undefined) {
    return fallback
  }

  if (typeof value !== 'string') {
    throw new ProblemInputError(`${field} must be a string`)
  }

  const normalized = value.trim()
  if (!normalized || normalized.length > maxLength) {
    throw new ProblemInputError(`${field} must be between 1 and ${maxLength} characters`)
  }

  return normalized
}

function normalizeChoice(value, field, fallback, allowedValues) {
  const normalized = normalizeText(value, field, fallback, 24).toLowerCase()
  if (!allowedValues.includes(normalized)) {
    throw new ProblemInputError(`${field} must be one of: ${allowedValues.join(', ')}`)
  }

  return normalized
}

export function buildProblemInput(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ProblemInputError('Request body must be a JSON object')
  }

  const userLevel = input.user_level === undefined ? input.userLevel : input.user_level

  return {
    topic: normalizeText(input.topic, 'topic', 'Arrays', 80),
    difficulty: normalizeChoice(input.difficulty, 'difficulty', 'easy', ['easy', 'medium', 'hard']),
    user_level: normalizeChoice(userLevel, 'user_level', 'beginner', ['beginner', 'intermediate', 'advanced']),
  }
}
