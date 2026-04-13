import { randomUUID } from 'node:crypto'
import type postgres from 'postgres'
import { sellerRepository } from './seller.repository'
import { NotFoundError, ForbiddenError } from '../../shared/errors'
import { maskApiKey } from '../../shared/utils'
import type { CreateSellerBody, UpdateSellerBody } from './seller.schema'
import type { Seller } from '../../plugins/auth'

export interface SellerResponse {
  id: string
  nome: string
  cnpj: string
  api_key: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

function toResponse(seller: Seller, showFullKey = false): SellerResponse {
  return {
    id: seller.id,
    nome: seller.nome,
    cnpj: seller.cnpj,
    api_key: showFullKey ? seller.api_key : maskApiKey(seller.api_key),
    ativo: seller.ativo,
    created_at: seller.created_at,
    updated_at: seller.updated_at,
  }
}

export function createSellerService(sql: postgres.Sql) {
  return {
    async create(data: CreateSellerBody): Promise<SellerResponse> {
      const apiKey = randomUUID()
      const seller = await sellerRepository.create(sql, {
        nome: data.nome,
        cnpj: data.cnpj,
        api_key: apiKey,
      })

      // On create, return the full api_key so the user can save it
      return toResponse(seller, true)
    },

    async getById(id: string, authenticatedSellerId: string): Promise<SellerResponse> {
      // Guard: seller can only access own data
      if (id !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const seller = await sellerRepository.findById(sql, id)

      if (!seller) {
        throw new NotFoundError('Seller', id)
      }

      if (!seller.ativo) {
        throw new NotFoundError('Seller', id)
      }

      return toResponse(seller)
    },

    async update(id: string, data: UpdateSellerBody, authenticatedSellerId: string): Promise<SellerResponse> {
      // Guard: seller can only update own data
      if (id !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const seller = await sellerRepository.update(sql, id, data)

      if (!seller) {
        throw new NotFoundError('Seller', id)
      }

      return toResponse(seller)
    },

    async remove(id: string, authenticatedSellerId: string): Promise<void> {
      // Guard: seller can only delete own data
      if (id !== authenticatedSellerId) {
        throw new ForbiddenError()
      }

      const deleted = await sellerRepository.softDelete(sql, id)

      if (!deleted) {
        throw new NotFoundError('Seller', id)
      }
    },
  }
}

export type SellerService = ReturnType<typeof createSellerService>
