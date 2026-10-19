export function createTutorSubmissionGate() {
  let inFlight = false

  return {
    capture(message) {
      if (inFlight || typeof message !== 'string' || !message.trim()) return null
      inFlight = true
      return message
    },
    release() {
      inFlight = false
    },
  }
}

export function appendTutorMessage(messages, message) {
  return [...messages, message]
}
