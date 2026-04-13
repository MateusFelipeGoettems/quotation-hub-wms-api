import type postgres from 'postgres'
import type { Seller } from '../plugins/auth'

export interface CreateSellerInput {
  nome: string
  cnpj: string
  api_key: string
}

export interface UpdateSellerInput {
  nome?: string
}

export const sellerRepository = {
  async findById(sql: postgres.Sql, id: string): Promise<Seller | null> {
    const [seller] = await sql<Seller[]>`
      SELECT id, nome, cnpj, api_key, ativo, created_at, updated_at
      FROM sellers
      WHERE id = ${id}
    `
    return seller ?? null
  },

  async findByApiKey(sql: postgres.Sql, apiKey: string): Promise<Seller | null> {
    const [seller] = await sql<Seller[]>`
      SELECT id, nome, cnpj, api_key, ativo, created_at, updated_at
      FROM sellers
      WHERE api_key = ${apiKey} AND ativo = true
    `
    return seller ?? null
  },

  async create(sql: postgres.Sql, data: CreateSellerInput): Promise<Seller> {
    const [seller] = await sql<Seller[]>`
      INSERT INTO sellers (nome, cnpj, api_key)
      VALUES (${data.nome}, ${data.cnpj}, ${data.api_key})
      RETURNING id, nome, cnpj, api_key, ativo, created_at, updated_at
    `
    return seller
  },

  async update(sql: postgres.Sql, id: string, data: UpdateSellerInput): Promise<Seller | null> {
    const [seller] = await sql<Seller[]>`
      UPDATE sellers
      SET nome = COALESCE(${data.nome ?? null}, nome),
          updated_at = NOW()
      WHERE id = ${id} AND ativo = true
      RETURNING id, nome, cnpj, api_key, ativo, created_at, updated_at
    `
    return seller ?? null
  },

  async softDelete(sql: postgres.Sql, id: string): Promise<boolean> {
    const result = await sql`
      UPDATE sellers
      SET ativo = false, updated_at = NOW()
      WHERE id = ${id} AND ativo = true
    `
    return result.count > 0
  },
}
