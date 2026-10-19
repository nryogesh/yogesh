import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import express from 'express'
import { createSubmissionsRouter, submissionsRouter } from '../src/routes/submissions.js'
import { SubmissionService } from '../src/services/submission-service.js'

async function withSubmissionServer(run, router = submissionsRouter) {
  const app = express()
  app.use(express.json({ limit: '32kb' }))
  app.use('/', router)
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.too.large') {
      return response.status(413).json({ success: false, error: 'Request body exceeds the 32 KB limit' })
    }
    return response.status(500).json({ success: false, error: 'Unexpected server error' })
  })
  const server = createServer(app)
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  try {
    await run(`http://127.0.0.1:${server.address().port}`)
  } finally {
    const closed = new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    server.closeAllConnections()
    await closed
  }
}

test('submission starter route exposes no sample or hidden evaluation cases', async () => {
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/pf-assignment-1`)
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.assignmentId, 'pf-assignment-1')
    assert.equal(payload.language, 'Java')
    assert.equal(payload.evaluationAvailable, false)
    assert.match(payload.evaluationMessage, /JAVA_SANDBOX_URL.*JAVA_SANDBOX_TOKEN/i)
    assert.match(payload.starterCode, /class Solution/)
    assert.doesNotMatch(JSON.stringify(payload), /referenceSolution|answerKey|testCases|expectedOutput|hiddenCases/)
  })
})

test('submission starter route marks assignments without fixtures unavailable', async () => {
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/arrays-assignment-2`)
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.evaluationAvailable, false)
    assert.match(payload.evaluationMessage, /not available for this assignment/i)
    assert.equal(payload.starterCode, null)
  })
})

test('submission starter route reports Docker daemon health failure', async () => {
  const service = new SubmissionService({
    sandboxUrl: 'http://127.0.0.1:3002',
    sandboxToken: 'test-worker-token',
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      json: async () => ({ available: false, reason: 'docker_daemon_unavailable' }),
    }),
  })
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/pf-assignment-1`)
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.evaluationAvailable, false)
    assert.match(payload.evaluationMessage, /Docker Desktop is unavailable/i)
  }, createSubmissionsRouter(service))
})

test('evaluation route rejects assignments without registered tests', async () => {
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/arrays-assignment-2/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'class Solution {}' }),
    })
    const payload = await response.json()

    assert.equal(response.status, 501)
    assert.match(payload.error, /tests are not available/i)
    assert.doesNotMatch(JSON.stringify(payload), /referenceSolution|testCases|expectedOutput|hiddenCases/)
  })
})

test('evaluation route fails closed and does not return worker fixtures', async () => {
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/pf-assignment-1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'class Solution {}' }),
    })
    const payload = await response.json()

    assert.equal(response.status, 503)
    assert.equal(payload.success, false)
    assert.match(payload.error, /JAVA_SANDBOX_URL/i)
    assert.doesNotMatch(JSON.stringify(payload), /referenceSolution|testCases|expected|hidden|values/)
  })
})

test('evaluation route explains Docker unavailability returned by the worker', async () => {
  const service = new SubmissionService({
    sandboxUrl: 'http://127.0.0.1:3002',
    sandboxToken: 'test-worker-token',
    fetchImpl: async () => ({ ok: false, status: 503 }),
  })
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/pf-assignment-1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'class Solution {}' }),
    })
    const payload = await response.json()

    assert.equal(response.status, 503)
    assert.match(payload.error, /Docker Desktop.*docker info/i)
  }, createSubmissionsRouter(service))
})

test('evaluation route rejects an invalid assignment ID', async () => {
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/unknown-assignment/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'class Solution {}' }),
    })
    const payload = await response.json()

    assert.equal(response.status, 404)
    assert.deepEqual(payload, { success: false, error: 'Published assignment was not found' })
  })
})

test('evaluation route rejects invalid Java source', async () => {
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/pf-assignment-1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: '' }),
    })
    const payload = await response.json()

    assert.equal(response.status, 400)
    assert.equal(payload.success, false)
    assert.match(payload.error, /non-empty Java string/)
    assert.doesNotMatch(JSON.stringify(payload), /referenceSolution|testCases|expectedOutput/)
  })
})

test('valid assignment submission returns passed status through the route without grading data', async () => {
  const service = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test/v1',
    sandboxToken: 'test-only-token',
    fetchImpl: async () => ({
      ok: true,
      text: async () => JSON.stringify({
        status: 'completed',
        results: [{ passed: true }, { passed: true }, { passed: true }, { passed: true }],
      }),
    }),
  })
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/pf-assignment-1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'class Solution {}' }),
    })
    const payload = await response.json()

    assert.equal(response.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.status, 'passed')
    assert.equal(payload.passed, true)
    assert.deepEqual(payload.sampleTests, { passed: 1, total: 1 })
    assert.doesNotMatch(JSON.stringify(payload), /referenceSolution|answerKey|testCases|expectedOutput|hiddenCases|grading/)
  }, createSubmissionsRouter(service))
})

test('oversized submission bodies return a bounded 413 response', async () => {
  await withSubmissionServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/pf-assignment-1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'x'.repeat(33000) }),
    })
    const payload = await response.json()

    assert.equal(response.status, 413)
    assert.match(payload.error, /32 KB/)
    assert.doesNotMatch(JSON.stringify(payload), /xxxxxxxxxx/)
  })
})