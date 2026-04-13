import type postgres from 'postgres'
import { distributionCenterRepository, type DistributionCenterDB } from './distribution-center.repository'
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors'
import type { CreateDistributionCenterBody, UpdateDistributionCenterBody } from './distribution-center.schema'

export function createDistributionCenterService(sql: postgres.Sql) {
  return {
    async create(sellerIdFromParams: string, authenticatedSellerId: string, data: CreateDistributionCenterBody): Promise<DistributionCenterDB> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const existingDc = await distributionCenterRepository.findByOriginWarehouseCodeAndSellerId(
        sql,
        data.origin_warehouse_code,
        authenticatedSellerId
      )

      if (existingDc) {
        throw new ConflictError('origin_warehouse_code already exists for this seller')
      }

      const ativo = data.ativo ?? true

      return distributionCenterRepository.create(sql, {
        ...data,
        seller_id: authenticatedSellerId,
        tms_id: data.tms_id ?? null,
        inscricao_estadual: data.inscricao_estadual ?? null,
        telefone: data.telefone ?? null,
        email: data.email ?? null,
        complemento: data.complemento ?? null,
        referencia: data.referencia ?? null,
        bairro: data.bairro ?? null,
        ativo,
      })
    },

    async getAll(sellerIdFromParams: string, authenticatedSellerId: string): Promise<DistributionCenterDB[]> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      return distributionCenterRepository.findAllBySellerId(sql, authenticatedSellerId)
    },

    async getById(id: string, sellerIdFromParams: string, authenticatedSellerId: string): Promise<DistributionCenterDB> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const dc = await distributionCenterRepository.findByIdAndSellerId(sql, id, authenticatedSellerId)

      if (!dc || !dc.ativo) {
        throw new NotFoundError('Distribution Center', id)
      }

      return dc
    },

    async update(id: string, sellerIdFromParams: string, authenticatedSellerId: string, data: UpdateDistributionCenterBody): Promise<DistributionCenterDB> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      // Check existence first
      const dcExists = await distributionCenterRepository.findByIdAndSellerId(sql, id, authenticatedSellerId)
      if (!dcExists || !dcExists.ativo) {
        throw new NotFoundError('Distribution Center', id)
      }

      if (data.origin_warehouse_code && data.origin_warehouse_code !== dcExists.origin_warehouse_code) {
        const existingDc = await distributionCenterRepository.findByOriginWarehouseCodeAndSellerId(
          sql,
          data.origin_warehouse_code,
          authenticatedSellerId
        )
        if (existingDc) {
          throw new ConflictError('origin_warehouse_code already exists for this seller')
        }
      }

      const dc = await distributionCenterRepository.update(sql, id, authenticatedSellerId, data)

      if (!dc) {
        throw new NotFoundError('Distribution Center', id)
      }

      return dc
    },

    async remove(id: string, sellerIdFromParams: string, authenticatedSellerId: string): Promise<void> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      // Hard delete as requested
      const deleted = await distributionCenterRepository.delete(sql, id, authenticatedSellerId)

      if (!deleted) {
        throw new NotFoundError('Distribution Center', id)
      }
    },
  }
}

export type DistributionCenterService = ReturnType<typeof createDistributionCenterService>
