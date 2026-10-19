import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSubmissionInput, SubmissionInputError } from '../src/models/submission.js'
import { SubmissionService, SubmissionServiceError } from '../src/services/submission-service.js'

const passingResults = { status: 'completed', results: [{ passed: true }, { passed: true }, { passed: true }, { passed: true }] }
const makeResponse = (payload, ok = true) => ({ ok, text: async () => JSON.stringify(payload) })

test('submission validation rejects malformed and oversized source', () => {
  assert.throws(() => buildSubmissionInput({ assignmentId: 'pf-assignment-1', source: '' }), SubmissionInputError)
  assert.throws(() => buildSubmissionInput({ assignmentId: 'pf-assignment-1', source: 'x'.repeat(24001) }), SubmissionInputError)
  assert.deepEqual(buildSubmissionInput({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }), {
    assignmentId: 'pf-assignment-1',
    source: 'class Solution {}',
  })
})

test('passing evaluation checks samples and additional cases without returning fixtures', async () => {
  let workerRequest
  const service = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test/v1',
    sandboxToken: 'test-only-token',
    fetchImpl: async (url, options) => {
      workerRequest = { url: url.toString(), options, payload: JSON.parse(options.body) }
      return makeResponse(passingResults)
    },
  })

  const result = await service.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' })

  assert.equal(result.status, 'passed')
  assert.deepEqual(result.sampleTests, { passed: 1, total: 1 })
  assert.equal(result.additionalTestsPassed, true)
  assert.equal(workerRequest.url, 'https://sandbox.example.test/v1/evaluate')
  assert.equal(workerRequest.options.redirect, 'error')
  assert.equal(workerRequest.payload.testCases.length, 4)
  assert.ok(workerRequest.payload.testCases.some((testCase) => testCase.visibility === 'additional'))
  assert.match(workerRequest.options.headers.Authorization, /^Bearer /)
  assert.doesNotMatch(JSON.stringify(result), /referenceSolution|answerKey|hidden|values|expected/)
})

test('failed hidden checks return no case inputs or expected values', async () => {
  const service = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => makeResponse({
      status: 'completed',
      results: [{ passed: true }, { passed: true }, { passed: false }, { passed: true }],
    }),
  })

  const result = await service.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' })

  assert.equal(result.status, 'failed')
  assert.equal(result.sampleTests.passed, 1)
  assert.equal(result.additionalTestsPassed, false)
  assert.match(result.feedback, /additional checks failed/i)
  assert.doesNotMatch(JSON.stringify(result), /referenceSolution|answerKey|hidden|expected|values/)
})

test('compiler diagnostics are translated to safe feedback', async () => {
  const service = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => makeResponse({
      status: 'compile_error',
      diagnostics: [{ code: 'CANNOT_FIND_SYMBOL', line: 7, raw: 'private worker path /secret' }],
    }),
  })

  const result = await service.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' })

  assert.equal(result.status, 'compile_error')
  assert.equal(result.diagnostics[0].line, 7)
  assert.match(result.diagnostics[0].message, /cannot resolve/i)
  assert.doesNotMatch(JSON.stringify(result), /private worker path|secret/)
})

test('runtime errors and execution timeouts return bounded feedback', async () => {
  const runtimeService = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => makeResponse({ status: 'runtime_error', stderr: 'secret worker output' }),
  })
  const timeoutService = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => makeResponse({ status: 'timeout' }),
  })

  const runtime = await runtimeService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' })
  const timeout = await timeoutService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' })

  assert.equal(runtime.status, 'runtime_error')
  assert.doesNotMatch(JSON.stringify(runtime), /secret worker output/)
  assert.equal(timeout.status, 'timeout')
  assert.match(timeout.feedback, /time limit/i)
})

test('missing sandbox configuration and unconfigured assignments fail closed', async () => {
  const unconfiguredService = new SubmissionService({ fetchImpl: async () => assert.fail('worker should not be called') })
  await assert.rejects(
    unconfiguredService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }),
    (error) => error instanceof SubmissionServiceError && /JAVA_SANDBOX_URL/i.test(error.message)
  )

  const configuredService = new SubmissionService({ sandboxUrl: 'https://sandbox.example.test' })
  await assert.rejects(
    configuredService.evaluate({ assignmentId: 'arrays-assignment-2', source: 'class Solution {}' }),
    (error) => error instanceof SubmissionInputError && error.statusCode === 501
  )
})

test('loopback worker availability requires an authenticated healthy Docker worker', async () => {
  const availableService = new SubmissionService({
    sandboxUrl: 'http://127.0.0.1:3002',
    sandboxToken: 'test-worker-token',
    fetchImpl: async (url, options) => {
      assert.equal(url.toString(), 'http://127.0.0.1:3002/health')
      assert.equal(options.headers.Authorization, 'Bearer test-worker-token')
      return { ok: true, json: async () => ({ available: true }) }
    },
  })
  const unavailableService = new SubmissionService({
    sandboxUrl: 'http://127.0.0.1:3002',
    sandboxToken: 'test-worker-token',
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      json: async () => ({ available: false, reason: 'docker_daemon_unavailable' }),
    }),
  })

  assert.equal(await availableService.isEvaluationAvailable('pf-assignment-1'), true)
  assert.equal(await unavailableService.isEvaluationAvailable('pf-assignment-1'), false)
  assert.equal(await availableService.isEvaluationAvailable('arrays-assignment-1'), false)
  assert.match((await unavailableService.getEvaluationStatus('pf-assignment-1')).message, /Docker Desktop is unavailable/i)
})

test('loopback worker status distinguishes missing token and unreachable worker', async () => {
  const missingTokenService = new SubmissionService({
    sandboxUrl: 'http://127.0.0.1:3002',
    fetchImpl: async () => assert.fail('health endpoint must not be called without a token'),
  })
  const unreachableService = new SubmissionService({
    sandboxUrl: 'http://127.0.0.1:3002',
    sandboxToken: 'test-worker-token',
    fetchImpl: async () => { throw new Error('connection refused') },
  })

  assert.match((await missingTokenService.getEvaluationStatus('pf-assignment-1')).message, /JAVA_SANDBOX_TOKEN/i)
  assert.match((await unreachableService.getEvaluationStatus('pf-assignment-1')).message, /could not be reached/i)
})

test('remote sandbox requires HTTPS and bearer authentication', async () => {
  const insecureService = new SubmissionService({ sandboxUrl: 'http://sandbox.example.test' })
  const missingTokenService = new SubmissionService({ sandboxUrl: 'https://sandbox.example.test' })

  await assert.rejects(
    insecureService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }),
    (error) => error instanceof SubmissionServiceError && /HTTPS/i.test(error.message)
  )
  await assert.rejects(
    missingTokenService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }),
    (error) => error instanceof SubmissionServiceError && /bearer token/i.test(error.message)
  )
})

test('worker network timeout, rejection, and invalid results become service errors', async () => {
  const timeoutService = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => { const error = new Error('timed out'); error.name = 'TimeoutError'; throw error },
  })
  const rejectedService = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => makeResponse({}, false),
  })
  const invalidResultService = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => makeResponse({ status: 'completed', results: [{ passed: true }] }),
  })

  await assert.rejects(timeoutService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }), (error) => error.statusCode === 504)
  await assert.rejects(rejectedService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }), (error) => error.statusCode === 502)
  await assert.rejects(invalidResultService.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }), (error) => error.statusCode === 502)
})

test('oversized worker responses are rejected', async () => {
  const service = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => ({ ok: true, text: async () => 'x'.repeat(32001) }),
  })

  await assert.rejects(
    service.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }),
    (error) => error instanceof SubmissionServiceError && error.statusCode === 502 && /oversized response/i.test(error.message)
  )
})

test('concurrent submissions are capped', async () => {
  let releaseWorker
  const workerGate = new Promise((resolve) => { releaseWorker = resolve })
  const service = new SubmissionService({
    sandboxUrl: 'https://sandbox.example.test',
    sandboxToken: 'test-token',
    fetchImpl: async () => {
      await workerGate
      return makeResponse(passingResults)
    },
  })

  const activeRequests = Array.from({ length: 4 }, () => service.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }))
  await assert.rejects(
    service.evaluate({ assignmentId: 'pf-assignment-1', source: 'class Solution {}' }),
    (error) => error instanceof SubmissionServiceError && error.statusCode === 503 && /busy/i.test(error.message)
  )

  releaseWorker()
  await Promise.all(activeRequests)
})