import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import express from 'express'
import { createProblemsRouter } from '../src/routes/problems.js'

async function withServer(run, service) {
  const app = express()
  app.use(express.json({ limit: '32kb' }))
  app.use('/', createProblemsRouter(service))
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    await run(`http://127.0.0.1:${server.address().port}`)
  } finally {
    const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
}

test('problem route returns a valid explicitly marked local fallback', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Arrays' }),
    })
    const result = await response.json()
    assert.equal(response.status, 200)
    assert.equal(result.success, true)
    assert.equal(result.fallback, true)
    assert.ok(result.examples.length > 0)
  }, {
    async generateProblem() {
      return {
        success: true,
        fallback: true,
        title: 'Warm-up',
        constraints: ['Use integer values.'],
        examples: [{ input: '[3, 5, 7]', output: '15', explanation: 'Add each value.' }],
        hints: ['Track a running total.', 'Return the total after the last value.'],
      }
    },
  })
})

test('problem route reports validation errors and safe temporary service errors', async () => {
  await withServer(async (baseUrl) => {
    const invalid = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: 'expert' }),
    })
    assert.equal(invalid.status, 400)
    assert.match((await invalid.json()).error, /difficulty/)

    const failed = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Arrays' }),
    })
    const result = await failed.json()
    assert.equal(failed.status, 503)
    assert.match(result.error, /temporarily unavailable/i)
    assert.doesNotMatch(JSON.stringify(result), /private detail|api key|stack|secret/)
  }, {
    async generateProblem(payload) {
      if (payload.difficulty === 'expert') {
        const { buildProblemInput } = await import('../src/models/problem.js')
        buildProblemInput(payload)
      }
      throw new Error('private detail: secret api key stack')
    },
  })
})
