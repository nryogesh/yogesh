import { javaEvaluationCases } from '../data/evaluation-cases.js'
import { dsaTopics } from '../data/topics.js'
import { buildSubmissionInput, SubmissionInputError } from '../models/submission.js'

const MAX_WALL_TIME_MS = 8000
const MAX_REQUEST_TIME_MS = 10000
const MAX_CONCURRENT_EVALUATIONS = 4
const SAFE_DIAGNOSTICS = {
  CANNOT_FIND_SYMBOL: 'Java cannot resolve a name used by your code.',
  INCOMPATIBLE_TYPES: 'A value type does not match the method contract.',
  MISSING_RETURN: 'A method must return a value on every required path.',
  SYNTAX_ERROR: 'Check the Java syntax near this line.',
}

export class SubmissionServiceError extends Error {
  constructor(message, statusCode = 503) {
    super(message)
    this.statusCode = statusCode
  }
}

function normalizeSandboxUrl(value) {
  if (!value) {
    throw new SubmissionServiceError('The Java sandbox is not configured. Set JAVA_SANDBOX_URL and JAVA_SANDBOX_TOKEN, then start the Java worker.')
  }

  let url
  try {
    url = new URL(value)
  } catch {
    throw new SubmissionServiceError('Java evaluation sandbox URL is invalid.')
  }

  const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (url.protocol !== 'https:' && !isLocalHttp) {
    throw new SubmissionServiceError('Java evaluation sandbox must use HTTPS outside localhost.')
  }

  return url
}

function sanitizeCompileDiagnostics(diagnostics) {
  if (!Array.isArray(diagnostics)) return []

  return diagnostics.slice(0, 8).map((diagnostic) => ({
    line: Number.isInteger(diagnostic?.line) && diagnostic.line > 0 ? diagnostic.line : null,
    message: SAFE_DIAGNOSTICS[diagnostic?.code] || 'The Java compiler reported a source error.',
  }))
}

function safeOutcome(status, diagnostics = []) {
  if (status === 'compile_error') {
    return {
      status,
      passed: false,
      feedback: 'Compilation failed. Review the Java diagnostics and method signature.',
      diagnostics: sanitizeCompileDiagnostics(diagnostics),
    }
  }

  if (status === 'runtime_error') {
    return { status, passed: false, feedback: 'Your program stopped with a runtime error. Check array boundaries and null handling.' }
  }

  if (status === 'timeout') {
    return { status, passed: false, feedback: 'Your program exceeded the execution time limit.' }
  }

  return null
}

async function readWorkerResponse(response) {
  const maxBytes = 32000
  if (!response.body?.getReader) {
    const text = await response.text()
    if (Buffer.byteLength(text, 'utf8') > maxBytes) {
      throw new SubmissionServiceError('The isolated Java worker returned an oversized response.', 502)
    }
    return text
  }

  const reader = response.body.getReader()
  const chunks = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      throw new SubmissionServiceError('The isolated Java worker returned an oversized response.', 502)
    }
    chunks.push(value)
  }

  const combined = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(combined)
}

export class SubmissionService {
  constructor({ sandboxUrl = process.env.JAVA_SANDBOX_URL, sandboxToken = process.env.JAVA_SANDBOX_TOKEN, fetchImpl = fetch } = {}) {
    this.sandboxUrl = sandboxUrl
    this.sandboxToken = sandboxToken
    this.fetchImpl = fetchImpl
    this.activeEvaluations = 0
  }

  async getEvaluationStatus(assignmentId) {
    if (!javaEvaluationCases[assignmentId]?.starterCode) {
      return { available: false, message: 'Automated evaluation is not available for this assignment yet.' }
    }
    if (!this.sandboxUrl) {
      return {
        available: false,
        message: 'The Java sandbox is not configured. Set JAVA_SANDBOX_URL and JAVA_SANDBOX_TOKEN in the backend environment, then start the Java worker.',
      }
    }

    let url
    try {
      url = normalizeSandboxUrl(this.sandboxUrl)
    } catch (error) {
      return { available: false, message: error.message }
    }
    if (!this.sandboxToken) {
      return {
        available: false,
        message: 'The Java sandbox token is not configured. Set JAVA_SANDBOX_TOKEN for both the backend and worker.',
      }
    }

    const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (!isLocalHttp) return { available: true, message: '' }

    url.pathname = `${url.pathname.replace(/\/$/, '')}/health`
    let response
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        redirect: 'error',
        headers: { Authorization: `Bearer ${this.sandboxToken}` },
        signal: AbortSignal.timeout(1500),
      })
    } catch {
      return {
        available: false,
        message: 'The isolated Java worker could not be reached. Start it with `npm run worker --prefix "backend ai"` and try again.',
      }
    }

    if (response.status === 401) {
      return {
        available: false,
        message: 'The Java worker rejected its token. Ensure JAVA_SANDBOX_TOKEN matches in the backend environment.',
      }
    }

    let result
    try {
      result = await response.json()
    } catch {
      return { available: false, message: 'The Java worker returned an invalid health response.' }
    }

    if (response.ok && result?.available === true) {
      return { available: true, message: '' }
    }
    if (result?.reason === 'docker_daemon_unavailable') {
      return {
        available: false,
        message: 'The Java worker is running, but Docker Desktop is unavailable. Start Docker Desktop and verify `docker info` before submitting.',
      }
    }
    if (!response.ok && result?.available === false) {
      return {
        available: false,
        message: 'The isolated Java worker is not healthy. Check that Docker Desktop is running and retry.',
      }
    }

    return {
      available: false,
      message: 'The isolated Java worker is not reporting healthy. Check the worker process and its Docker connection.',
    }
  }

  async isEvaluationAvailable(assignmentId) {
    return (await this.getEvaluationStatus(assignmentId)).available
  }

  async evaluate(payload = {}) {
    const { assignmentId, source } = buildSubmissionInput(payload)
    const assignmentExists = dsaTopics.some((topic) => (
      topic.status === 'published' && topic.assignments.some((assignment) => assignment.id === assignmentId)
    ))
    if (!assignmentExists) {
      throw new SubmissionInputError('Published assignment was not found', 404)
    }

    const fixtures = javaEvaluationCases[assignmentId]
    if (!fixtures) {
      throw new SubmissionInputError('Evaluation tests are not available for this assignment yet', 501)
    }

    const sandboxUrl = normalizeSandboxUrl(this.sandboxUrl)
    if (!this.sandboxToken) {
      throw new SubmissionServiceError('A bearer token is required for the isolated Java worker.')
    }
    sandboxUrl.pathname = `${sandboxUrl.pathname.replace(/\/$/, '')}/evaluate`
    const sampleCount = fixtures.samples.length
    const testCases = [
      ...fixtures.samples.map((testCase) => ({ visibility: 'sample', ...testCase })),
      ...fixtures.additional.map((testCase) => ({ visibility: 'additional', ...testCase })),
    ]

    const headers = { 'Content-Type': 'application/json' }
    if (this.sandboxToken) headers.Authorization = `Bearer ${this.sandboxToken}`

    if (this.activeEvaluations >= MAX_CONCURRENT_EVALUATIONS) {
      throw new SubmissionServiceError('The Java evaluation service is busy. Try again shortly.', 503)
    }

    this.activeEvaluations += 1
    try {
      return await this.evaluateWithWorker({
        sandboxUrl,
        headers,
        assignmentId,
        source,
        fixtures,
        sampleCount,
        testCases,
      })
    } finally {
      this.activeEvaluations -= 1
    }
  }

  async evaluateWithWorker({ sandboxUrl, headers, assignmentId, source, fixtures, sampleCount, testCases }) {
    let response
    try {
      response = await this.fetchImpl(sandboxUrl, {
        method: 'POST',
        redirect: 'error',
        headers,
        signal: AbortSignal.timeout(MAX_REQUEST_TIME_MS),
        body: JSON.stringify({
          language: 'java',
          assignmentId,
          source,
          entrypoint: fixtures.entrypoint,
          testCases,
          limits: {
            wallTimeMs: MAX_WALL_TIME_MS,
            memoryMb: 128,
            outputBytes: 16000,
          },
        }),
      })
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        throw new SubmissionServiceError('The isolated Java worker did not respond before the service timeout.', 504)
      }
      throw new SubmissionServiceError('The isolated Java worker could not be reached. Check that the worker process is running.', 503)
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new SubmissionServiceError('The Java worker rejected its token. Ensure JAVA_SANDBOX_TOKEN matches in both processes.', 503)
      }
      if (response.status === 503) {
        throw new SubmissionServiceError('Java execution is unavailable. Start Docker Desktop, verify `docker info`, and retry.', 503)
      }
      throw new SubmissionServiceError('The isolated Java worker rejected the evaluation request. Check the worker configuration and assignment contract.', 502)
    }

    let resultText
    try {
      resultText = await readWorkerResponse(response)
    } catch (error) {
      if (error instanceof SubmissionServiceError) throw error
      throw new SubmissionServiceError('The isolated Java worker returned an invalid response.', 502)
    }

    let result
    try {
      result = JSON.parse(resultText)
    } catch {
      throw new SubmissionServiceError('The isolated Java worker returned an invalid response.', 502)
    }

    const outcome = safeOutcome(result?.status, result?.diagnostics)
    if (outcome) return outcome

    if (result?.status !== 'completed' || !Array.isArray(result.results) || result.results.length !== testCases.length || result.results.some((item) => typeof item?.passed !== 'boolean')) {
      throw new SubmissionServiceError('The isolated Java worker returned an invalid evaluation result.', 502)
    }

    const samplePassed = result.results.slice(0, sampleCount).filter((item) => item.passed).length
    const additionalResults = result.results.slice(sampleCount)
    const additionalPassed = additionalResults.filter((item) => item.passed).length
    const passed = samplePassed === sampleCount && additionalPassed === additionalResults.length

    return {
      status: passed ? 'passed' : 'failed',
      passed,
      sampleTests: { passed: samplePassed, total: sampleCount },
      additionalTestsPassed: additionalPassed === additionalResults.length,
      feedback: passed
        ? 'All sample and additional checks passed.'
        : samplePassed < sampleCount
          ? 'One or more visible sample cases failed. Check your method result and formatting.'
          : 'Some additional checks failed. Review edge cases and boundary behavior.',
    }
  }
}

export function getJavaSubmissionStarter(assignmentId) {
  return javaEvaluationCases[assignmentId]?.starterCode || null
}