import { readTutorChatResponse } from './tutor-chat-response'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export async function fetchCurriculum(progress) {
  const response = progress
    ? await fetch(`${API_BASE_URL}/api/curriculum/progression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    })
    : await fetch(`${API_BASE_URL}/api/curriculum`)
  const data = await response.json().catch(() => null)

  if (!response.ok || data?.success !== true || !Array.isArray(data.topics)) {
    throw new Error(data?.error || 'Could not load the curriculum')
  }

  return data.topics
}

export async function submitCurriculumQuiz({ topicId, quizId, answers, progress }) {
  const response = await fetch(`${API_BASE_URL}/api/curriculum/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId, quizId, answers, progress }),
  })
  const data = await response.json().catch(() => null)

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.error || 'Could not submit the knowledge check')
  }

  return data
}

export async function fetchSubmissionStarter(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/api/submissions/${encodeURIComponent(assignmentId)}`)
  const data = await response.json().catch(() => null)

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.error || 'Could not load the Java starter code')
  }

  return data
}

export async function fetchSubmissionSolution(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/api/submissions/${encodeURIComponent(assignmentId)}/solution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: true }),
  })
  const data = await response.json().catch(() => null)

  if (!response.ok || data?.success !== true || typeof data.sourceCode !== 'string') {
    throw new Error(data?.error || 'Could not load the requested reference solution')
  }

  return data
}

export async function runJavaAssignment(assignmentId, source, customInput = null) {
  const response = await fetch(`${API_BASE_URL}/api/submissions/${encodeURIComponent(assignmentId)}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, customInput }),
  })
  const data = await response.json().catch(() => null)

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.error || 'Could not run this Java solution')
  }

  return data
}

export async function submitJavaAssignment(assignmentId, source) {
  const response = await fetch(`${API_BASE_URL}/api/submissions/${encodeURIComponent(assignmentId)}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  })
  const data = await response.json().catch(() => null)

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.error || 'Could not evaluate this Java submission')
  }

  return data
}

export async function postChat(message, context = {}) {
  const payload = {
    message,
    topic: context.topic || 'Binary Search',
    difficulty: context.difficulty || 'beginner',
    language: context.language || 'Java',
    user_level: context.userLevel || 'beginner',
    conversation_history: context.conversationHistory || [],
    assignment_id: context.assignmentId,
  }

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return readTutorChatResponse(response)
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health/ai`)
  if (!response.ok) {
    return { provider: 'unknown', available: false, fallback: false, mode: 'unavailable', label: 'AI provider unavailable' }
  }

  return response.json()
}

export async function postHint(context = {}) {
  const response = await fetch(`${API_BASE_URL}/api/hints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: context.topic || 'Binary Search',
      difficulty: context.difficulty || 'beginner',
      conversation_history: context.conversationHistory || [],
      assignment_id: context.assignmentId,
      hint_stage: context.hintStage,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || 'The mentor could not provide a hint')
  }

  return data
}

export async function generateProblem({ topic = 'Arrays', difficulty = 'easy', userLevel = 'beginner' } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/problems/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty, user_level: userLevel }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || 'Could not generate a practice problem')
  }

  return data
}
