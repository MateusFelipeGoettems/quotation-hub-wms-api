import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import dbPlugin from './plugins/db'
import authPlugin from './plugins/auth'
import { sellerRoutes } from './modules/sellers/seller.route'
import { distributionCenterRoutes } from './modules/distribution-centers/distribution-center.route'
import { externalSystemRoutes } from './modules/external-systems/external-system.route'
import { AppError } from './shared/errors'
import { ZodError } from 'zod'

export function buildApp() {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === 'production'
        ? { level: 'info' }
        : {
            level: 'info',
            transport: {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          },
  })

  // Plugins
  app.register(sensible)
  app.register(dbPlugin)
  app.register(authPlugin)

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    // Zod validation errors → 400
    if (error instanceof ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        details: error.errors,
      })
    }

    // Custom app errors → specific status code
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      })
    }

    // Unexpected errors → 500
    request.log.error(error)
    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  })

  // Health check — no auth
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Routes
  app.register(sellerRoutes)
  app.register(distributionCenterRoutes)
  app.register(externalSystemRoutes)

  return app
}
