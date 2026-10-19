export class SubmissionInputError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

export function buildSubmissionInput(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new SubmissionInputError('Request body must be a JSON object')
  }

  if (typeof input.assignmentId !== 'string' || !input.assignmentId.trim() || input.assignmentId.length > 80) {
    throw new SubmissionInputError('assignmentId must be a string between 1 and 80 characters')
  }

  if (typeof input.source !== 'string' || !input.source.trim()) {
    throw new SubmissionInputError('source must be a non-empty Java string')
  }

  if (Buffer.byteLength(input.source, 'utf8') > 24000) {
    throw new SubmissionInputError('source must not exceed 24000 UTF-8 bytes')
  }

  return {
    assignmentId: input.assignmentId.trim(),
    source: input.source,
  }
}