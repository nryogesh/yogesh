export function normalizeConversationHistory(history = []) {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter((item) => item && typeof item?.content === 'string')
    .slice(-12)
    .map(({ role, content }) => ({
      role: role === 'assistant' ? 'assistant' : 'user',
      content: content.trim().slice(0, 4000),
    }))
}
