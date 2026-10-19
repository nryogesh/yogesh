export async function readTutorChatResponse(response) {
  const data = await response.json().catch(() => null)

  if (!response.ok || data?.success !== true || typeof data.response !== 'string') {
    throw new Error(data?.error || 'The mentor could not respond')
  }

  return data
}
