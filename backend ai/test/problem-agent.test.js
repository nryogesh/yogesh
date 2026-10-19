import assert from 'node:assert/strict'
import test from 'node:test'
import { ProblemGeneratorAgent } from '../src/agents/problem-agent.js'

const validProblem = JSON.stringify({
  title: 'Find the first match',
  description: 'Return the first index where the target occurs.',
  constraints: ['1 <= n <= 1000'],
  examples: [{ input: '[1, 2], target = 2', output: '1', explanation: 'The second value matches.' }],
  hints: ['Inspect each item.', 'Stop at the first match.'],
})

function provider({ available = true, result = validProblem, error } = {}) {
  return {
    async checkAvailability() { return available },
    async generateResponse(_prompt, options) {
      this.options = options
      if (error) throw error
      return result
    },
  }
}

test('problem agent validates generated output and requests bounded concise generation', async () => {
  const ai = provider()
  const result = await new ProblemGeneratorAgent(ai).generate({
    topic: 'Arrays',
    difficulty: 'medium',
    userLevel: 'intermediate',
  })

  assert.equal(result.success, true)
  assert.equal(result.fallback, false)
  assert.equal(result.fallbackReason, undefined)
  assert.equal(result.title, 'Find the first match')
  assert.deepEqual(ai.options, { maxOutputTokens: 1536, timeoutMs: 18000 })
})

test('problem agent returns a clearly marked local problem if provider is unavailable', async () => {
  const result = await new ProblemGeneratorAgent(provider({ available: false })).generate({ topic: 'Binary Search' })
  assert.equal(result.fallback, true)
  assert.equal(result.fallbackReason, 'provider_unavailable')
  assert.match(result.title, /sorted array/i)
  assert.match(result.description, /sorted array/i)
})

test('problem agent falls back on malformed and incomplete model output', async () => {
  for (const result of ['{broken json', JSON.stringify({ title: 'Missing content' })]) {
    const problem = await new ProblemGeneratorAgent(provider({ result })).generate({ topic: 'Arrays' })
    assert.equal(problem.fallback, true)
    assert.equal(problem.fallbackReason, 'invalid_model_output')
    assert.ok(problem.examples.length > 0)
    assert.ok(problem.hints.length >= 2)
  }
})

test('problem agent handles truncation, temporary failures, and timeouts with fallback', async () => {
  for (const [code, reason] of [
    ['RESPONSE_TRUNCATED', 'truncated_response'],
    ['SERVICE_UNAVAILABLE', 'provider_temporary_failure'],
    ['TIMEOUT', 'provider_timeout'],
  ]) {
    const problem = await new ProblemGeneratorAgent(provider({
      error: Object.assign(new Error('upstream details must remain private'), { code }),
    })).generate({ topic: 'Arrays' })
    assert.equal(problem.fallback, true)
    assert.equal(problem.fallbackReason, reason)
    assert.doesNotMatch(JSON.stringify(problem), /upstream details|stack|api key/i)
  }
})
