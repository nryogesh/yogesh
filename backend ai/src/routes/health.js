import express from 'express'
import { createProvider } from '../ai/provider-factory.js'
import { buildProviderStatus } from '../utils/provider-status.js'

const router = express.Router()

router.get('/', async (_request, response) => {
  const provider = createProvider()
  const available = await provider.checkAvailability().catch(() => false)
  const status = buildProviderStatus({
    provider: provider.name,
    available,
    fallback: provider.name === 'local',
  })

  response.json({
    status: 'ok',
    ...status,
  })
})

router.get('/ai', async (_request, response) => {
  const provider = createProvider()
  const available = await provider.checkAvailability().catch(() => false)
  const status = buildProviderStatus({
    provider: provider.name,
    available,
    fallback: provider.name === 'local',
  })

  response.json(status)
})

export { router as healthRouter }
