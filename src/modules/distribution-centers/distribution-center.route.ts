import type { FastifyInstance } from 'fastify'
import { createDistributionCenterService } from './distribution-center.service'
import { createDistributionCenterSchema, updateDistributionCenterSchema, distributionCenterParamsSchema } from './distribution-center.schema'

export async function distributionCenterRoutes(fastify: FastifyInstance) {
  const service = createDistributionCenterService(fastify.sql)

  fastify.post('/sellers/:seller_id/distribution-centers', async (request, reply) => {
    const { seller_id } = distributionCenterParamsSchema.parse(request.params)
    const body = createDistributionCenterSchema.parse(request.body)
    const dc = await service.create(seller_id, request.seller.id, body)
    return reply.code(201).send(dc)
  })

  fastify.get('/sellers/:seller_id/distribution-centers', async (request, reply) => {
    const { seller_id } = distributionCenterParamsSchema.parse(request.params)
    const dcs = await service.getAll(seller_id, request.seller.id)
    return reply.send(dcs)
  })

  fastify.get('/sellers/:seller_id/distribution-centers/:id', async (request, reply) => {
    const { seller_id, id } = distributionCenterParamsSchema.parse(request.params)
    const dc = await service.getById(id!, seller_id, request.seller.id)
    return reply.send(dc)
  })

  fastify.put('/sellers/:seller_id/distribution-centers/:id', async (request, reply) => {
    const { seller_id, id } = distributionCenterParamsSchema.parse(request.params)
    const body = updateDistributionCenterSchema.parse(request.body)
    const dc = await service.update(id!, seller_id, request.seller.id, body)
    return reply.send(dc)
  })

  fastify.delete('/sellers/:seller_id/distribution-centers/:id', async (request, reply) => {
    const { seller_id, id } = distributionCenterParamsSchema.parse(request.params)
    await service.remove(id!, seller_id, request.seller.id)
    return reply.code(204).send()
  })
}
