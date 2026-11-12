import express from 'express'
import { createProvider } from '../ai/provider-factory.js'
import { buildProviderStatus } from '../utils/provider-status.js'

export function createHealthRouter(providerFactory = createProvider) {
  const healthRouter = express.Router()

  const getProviderStatus = async () => {
    const provider = providerFactory()
    const available = await provider.checkAvailability()
    return buildProviderStatus({
      provider: provider?.name || 'local',
      available,
      fallback: provider?.name === 'local',
    })
  }

  const sendProviderStatus = async (response, includeOverallStatus = false) => {
    try {
      const status = await getProviderStatus()
      response.json(includeOverallStatus ? { status: 'ok', ...status } : status)
    } catch {
      response.status(503).json({
        status: 'error',
        success: false,
        error: 'AI provider status could not be determined',
      })
    }
  }

  healthRouter.get('/', async (_request, response) => {
    await sendProviderStatus(response, true)
  })

  healthRouter.get('/ai', async (_request, response) => {
    await sendProviderStatus(response)
  })

  return healthRouter
}

export const healthRouter = createHealthRouter()
