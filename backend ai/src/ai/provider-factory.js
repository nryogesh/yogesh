import { config } from '../config.js'
import { LocalAIProvider } from './local-provider.js'
import { ClaudeAIProvider } from './claude-provider.js'
import { GeminiAIProvider } from './gemini-provider.js'

export function createProvider() {
  switch (config.aiProvider) {
    case 'claude':
      return new ClaudeAIProvider()
    case 'gemini':
      return new GeminiAIProvider()
    case 'local':
    default:
      return new LocalAIProvider()
  }
}
