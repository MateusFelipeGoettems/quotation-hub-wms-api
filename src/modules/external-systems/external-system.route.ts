import type { FastifyInstance } from 'fastify'
import { createExternalSystemService } from './external-system.service'
import { createExternalSystemSchema, updateExternalSystemSchema, externalSystemParamsSchema } from './external-system.schema'

export async function externalSystemRoutes(fastify: FastifyInstance) {
  const service = createExternalSystemService(fastify.sql)

  fastify.post('/sellers/:seller_id/external-system', async (request, reply) => {
    const { seller_id } = externalSystemParamsSchema.parse(request.params)
    const body = createExternalSystemSchema.parse(request.body)
    const system = await service.create(seller_id, request.seller.id, body)
    return reply.code(201).send(system)
  })

  fastify.get('/sellers/:seller_id/external-system', async (request, reply) => {
    const { seller_id } = externalSystemParamsSchema.parse(request.params)
    const systems = await service.getAll(seller_id, request.seller.id)
    return reply.send(systems)
  })

  fastify.get('/sellers/:seller_id/external-system/:id', async (request, reply) => {
    const { seller_id, id } = externalSystemParamsSchema.parse(request.params)
    const system = await service.getById(id!, seller_id, request.seller.id)
    return reply.send(system)
  })

  fastify.put('/sellers/:seller_id/external-system/:id', async (request, reply) => {
    const { seller_id, id } = externalSystemParamsSchema.parse(request.params)
    const body = updateExternalSystemSchema.parse(request.body)
    const system = await service.update(id!, seller_id, request.seller.id, body)
    return reply.send(system)
  })

  fastify.delete('/sellers/:seller_id/external-system/:id', async (request, reply) => {
    const { seller_id, id } = externalSystemParamsSchema.parse(request.params)
    await service.remove(id!, seller_id, request.seller.id)
    return reply.code(204).send()
  })
}
