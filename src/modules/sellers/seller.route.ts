import type { FastifyInstance } from 'fastify'
import { createSellerService } from './seller.service'
import { createSellerSchema, updateSellerSchema, sellerParamsSchema } from './seller.schema'
import { AppError } from '../../shared/errors'

export async function sellerRoutes(fastify: FastifyInstance) {
  const service = createSellerService(fastify.sql)

  // POST /sellers — no auth required
  fastify.post('/sellers', async (request, reply) => {
    const body = createSellerSchema.parse(request.body)
    const seller = await service.create(body)
    return reply.code(201).send(seller)
  })

  // GET /sellers/:id
  fastify.get('/sellers/:id', async (request, reply) => {
    const { id } = sellerParamsSchema.parse(request.params)
    const seller = await service.getById(id, request.seller.id)
    return reply.send(seller)
  })

  // PUT /sellers/:id
  fastify.put('/sellers/:id', async (request, reply) => {
    const { id } = sellerParamsSchema.parse(request.params)
    const body = updateSellerSchema.parse(request.body)
    const seller = await service.update(id, body, request.seller.id)
    return reply.send(seller)
  })

  // DELETE /sellers/:id
  fastify.delete('/sellers/:id', async (request, reply) => {
    const { id } = sellerParamsSchema.parse(request.params)
    await service.remove(id, request.seller.id)
    return reply.code(204).send()
  })
}
