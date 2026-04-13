import type postgres from 'postgres'
import { externalSystemRepository, type ExternalSystemDB } from './external-system.repository'
import { NotFoundError, ForbiddenError } from '../../shared/errors'
import type { CreateExternalSystemBody, UpdateExternalSystemBody } from './external-system.schema'

export type ExternalSystemResponse = Omit<ExternalSystemDB, 'senha_hash' | 'client_secret' | 'token'>

function toResponse(system: ExternalSystemDB): ExternalSystemResponse {
  const { senha_hash, client_secret, token, ...safeSystem } = system
  return safeSystem
}

export function createExternalSystemService(sql: postgres.Sql) {
  return {
    async create(sellerIdFromParams: string, authenticatedSellerId: string, data: CreateExternalSystemBody): Promise<ExternalSystemResponse> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const ativo = data.ativo ?? true

      const system = await externalSystemRepository.create(sql, {
        ...data,
        seller_id: authenticatedSellerId,
        base_url: data.base_url ?? null,
        api_key: data.api_key ?? null,
        token: data.token ?? null,
        usuario: data.usuario ?? null,
        senha_hash: data.senha_hash ?? null,
        client_id: data.client_id ?? null,
        client_secret: data.client_secret ?? null,
        token_expires_at: data.token_expires_at ? new Date(data.token_expires_at) : null,
        extra_fields: data.extra_fields ?? null,
        ativo,
      })

      return toResponse(system)
    },

    async getAll(sellerIdFromParams: string, authenticatedSellerId: string): Promise<ExternalSystemResponse[]> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const systems = await externalSystemRepository.findAllBySellerId(sql, authenticatedSellerId)
      return systems.map(toResponse)
    },

    async getById(id: string, sellerIdFromParams: string, authenticatedSellerId: string): Promise<ExternalSystemResponse> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const system = await externalSystemRepository.findByIdAndSellerId(sql, id, authenticatedSellerId)

      if (!system || !system.ativo) {
        throw new NotFoundError('External System', id)
      }

      return toResponse(system)
    },

    async update(id: string, sellerIdFromParams: string, authenticatedSellerId: string, data: UpdateExternalSystemBody): Promise<ExternalSystemResponse> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const systemExists = await externalSystemRepository.findByIdAndSellerId(sql, id, authenticatedSellerId)
      if (!systemExists || !systemExists.ativo) {
        throw new NotFoundError('External System', id)
      }

      const processedData: any = { ...data }
      if (processedData.token_expires_at) {
        processedData.token_expires_at = new Date(processedData.token_expires_at)
      }

      const system = await externalSystemRepository.update(sql, id, authenticatedSellerId, processedData)

      if (!system) {
        throw new NotFoundError('External System', id)
      }

      return toResponse(system)
    },

    async remove(id: string, sellerIdFromParams: string, authenticatedSellerId: string): Promise<void> {
      if (sellerIdFromParams !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const deleted = await externalSystemRepository.delete(sql, id, authenticatedSellerId)

      if (!deleted) {
        throw new NotFoundError('External System', id)
      }
    },
  }
}

export type ExternalSystemService = ReturnType<typeof createExternalSystemService>
