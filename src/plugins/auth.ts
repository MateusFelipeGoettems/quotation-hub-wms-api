import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export interface Seller {
  id: string
  nome: string
  cnpj: string
  api_key: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

declare module 'fastify' {
  interface FastifyRequest {
    seller: Seller
  }
}

const PUBLIC_ROUTES = ['/health']

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('seller', null as unknown as Seller)

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for public routes
    if (PUBLIC_ROUTES.includes(request.url)) return

    // Skip auth for POST /sellers (open endpoint)
    if (request.method === 'POST' && request.url === '/sellers') return

    const apiKey = request.headers['x-api-key'] as string | undefined

    if (!apiKey) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing x-api-key header',
      })
    }

    const [seller] = await fastify.sql<Seller[]>`
      SELECT id, nome, cnpj, api_key, ativo, created_at, updated_at
      FROM sellers
      WHERE api_key = ${apiKey} AND ativo = true
    `

    if (!seller) {
      return reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid API key',
      })
    }

    request.seller = seller
  })
}

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['db'],
})
