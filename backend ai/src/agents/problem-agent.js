import { createProvider } from '../ai/provider-factory.js'

const PROBLEM_GENERATION_OPTIONS = { maxOutputTokens: 1536, timeoutMs: 18_000 }

function fallbackProblem({ topic, difficulty, userLevel, reason }) {
  const isSearchTopic = /search/i.test(topic)

  return {
    success: true,
    development: false,
    fallback: true,
    fallbackReason: reason,
    title: isSearchTopic ? 'Find a target in a sorted array' : `${topic} warm-up challenge`,
    description: isSearchTopic
      ? 'Given a sorted array of distinct integers and a target value, return the index of the target, or -1 if it is not present. Use the sorted order to avoid checking every element.'
      : `Given an integer array, return the sum of its values. This short, deterministic warm-up is provided while live problem generation is unavailable.`,
    difficulty,
    topic,
    user_level: userLevel,
    constraints: isSearchTopic
      ? ['0 <= nums.length <= 10^5', 'The array is sorted in strictly increasing order', 'Values fit in a 32-bit signed integer']
      : ['0 <= nums.length <= 10^5', 'Values fit in a 32-bit signed integer', 'Return 0 for an empty array'],
    examples: isSearchTopic
      ? [{
          input: 'nums = [1, 3, 5, 7, 9], target = 7',
          output: '3',
          explanation: 'The target 7 is at index 3.',
        }]
      : [{
          input: 'values = [3, 5, 7]',
          output: '15',
          explanation: 'Adding the three values gives 3 + 5 + 7 = 15.',
        }],
    hints: isSearchTopic
      ? [
          'Compare the target with the middle element.',
          'Discard the half that cannot contain the target.',
          'Stop when the search range is empty; the remaining index is the answer.',
        ]
      : [
          'Keep a running total as you visit each value.',
          'An empty array has no values to add.',
          'Use a numeric type large enough for the sum if the constraints require it.',
        ],
  }
}

function getFallbackReason(error) {
  if (error?.code === 'RESPONSE_TRUNCATED') return 'truncated_response'
  if (error?.code === 'TIMEOUT') return 'provider_timeout'
  if (['SERVICE_UNAVAILABLE', 'NETWORK_ERROR', 'RATE_LIMITED'].includes(error?.code)) return 'provider_temporary_failure'
  if (/returned (an empty|an invalid|an incomplete) problem/i.test(error?.message || '')) return 'invalid_model_output'
  return 'provider_error'
}

function parseProblem(generated) {
  const text = typeof generated === 'string' ? generated : generated?.text || generated?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('The AI provider returned an empty problem.')
  }

  const jsonText = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  let problem
  try {
    problem = JSON.parse(jsonText)
  } catch {
    throw new Error('The AI provider returned an invalid problem format.')
  }

  const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
  if (
    !isNonEmptyString(problem?.title) || problem.title.length > 160 ||
    !isNonEmptyString(problem?.description) || problem.description.length > 4000 ||
    !Array.isArray(problem.constraints) || problem.constraints.length < 1 || problem.constraints.length > 12 ||
    !problem.constraints.every(isNonEmptyString) ||
    !Array.isArray(problem.examples) || problem.examples.length < 1 || problem.examples.length > 5 ||
    !problem.examples.every((example) => (
      isNonEmptyString(example?.input) &&
      isNonEmptyString(example?.output) &&
      isNonEmptyString(example?.explanation)
    )) ||
    !Array.isArray(problem.hints) || problem.hints.length < 2 || problem.hints.length > 5 ||
    !problem.hints.every(isNonEmptyString)
  ) {
    throw new Error('The AI provider returned an incomplete problem.')
  }

  return {
    title: problem.title.trim(),
    description: problem.description.trim(),
    constraints: problem.constraints.map((constraint) => constraint.trim()),
    examples: problem.examples.map((example) => ({
      input: example.input.trim(),
      output: example.output.trim(),
      explanation: example.explanation.trim(),
    })),
    hints: problem.hints.map((hint) => hint.trim()),
  }
}

export class ProblemGeneratorAgent {
  constructor(provider = createProvider()) {
    this.provider = provider
  }

  async generate({ topic = 'Arrays', difficulty = 'easy', userLevel = 'beginner' } = {}) {
    const prompt = `Create one original data structures and algorithms practice problem.

Topic: ${topic}
Difficulty: ${difficulty}
Learner level: ${userLevel}

Return only a valid JSON object with this exact shape:
{
  "title": "Problem title (short)",
  "description": "Clear standalone problem statement (under 120 words)",
  "constraints": ["Constraint"],
  "examples": [{"input": "Example input", "output": "Expected output", "explanation": "Why this output is correct"}],
  "hints": ["First progressive hint", "Second progressive hint"]
}

Include one concise example, 2-3 short hints, and at most 4 concise constraints. Do not include a solution or markdown fences.`

    try {
      if (!(await this.provider.checkAvailability())) {
        return fallbackProblem({ topic, difficulty, userLevel, reason: 'provider_unavailable' })
      }

      const generated = await this.provider.generateResponse(prompt, PROBLEM_GENERATION_OPTIONS)
      if (generated && typeof generated === 'object' && generated.success === false) {
        return fallbackProblem({ topic, difficulty, userLevel, reason: 'provider_unavailable' })
      }

      return {
        success: true,
        development: false,
        fallback: false,
        ...parseProblem(generated),
        difficulty,
        topic,
        user_level: userLevel,
      }
    } catch (error) {
      return fallbackProblem({
        topic,
        difficulty,
        userLevel,
        reason: getFallbackReason(error),
      })
    }
  }
}
