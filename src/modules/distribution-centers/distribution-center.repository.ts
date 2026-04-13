import type postgres from 'postgres'

export interface DistributionCenterDB {
  id: string
  seller_id: string
  tms_id: string | null
  origin_warehouse_code: string
  nome_oficial: string
  cnpj: string
  inscricao_estadual: string | null
  telefone: string | null
  email: string | null
  cep: string
  logradouro: string
  numero: string
  complemento: string | null
  referencia: string | null
  bairro: string | null
  cidade: string
  estado: string
  ativo: boolean
  created_at: Date
  updated_at: Date
}

export type CreateDistributionCenterInput = Omit<DistributionCenterDB, 'id' | 'created_at' | 'updated_at'>
export type UpdateDistributionCenterInput = Partial<CreateDistributionCenterInput>

export const distributionCenterRepository = {
  async findByIdAndSellerId(sql: postgres.Sql, id: string, sellerId: string): Promise<DistributionCenterDB | null> {
    const [dc] = await sql<DistributionCenterDB[]>`
      SELECT *
      FROM distribution_centers
      WHERE id = ${id} AND seller_id = ${sellerId}
    `
    return dc ?? null
  },

  async findByOriginWarehouseCodeAndSellerId(sql: postgres.Sql, originWarehouseCode: string, sellerId: string): Promise<DistributionCenterDB | null> {
    const [dc] = await sql<DistributionCenterDB[]>`
      SELECT *
      FROM distribution_centers
      WHERE origin_warehouse_code = ${originWarehouseCode} AND seller_id = ${sellerId} AND ativo = true
    `
    return dc ?? null
  },

  async findAllBySellerId(sql: postgres.Sql, sellerId: string): Promise<DistributionCenterDB[]> {
    return sql<DistributionCenterDB[]>`
      SELECT *
      FROM distribution_centers
      WHERE seller_id = ${sellerId} AND ativo = true
    `
  },

  async create(sql: postgres.Sql, data: CreateDistributionCenterInput): Promise<DistributionCenterDB> {
    const [dc] = await sql<DistributionCenterDB[]>`
      INSERT INTO distribution_centers (
        seller_id, tms_id, origin_warehouse_code, nome_oficial, cnpj,
        inscricao_estadual, telefone, email, cep, logradouro, numero,
        complemento, referencia, bairro, cidade, estado, ativo
      ) VALUES (
        ${data.seller_id}, ${data.tms_id ?? null}, ${data.origin_warehouse_code}, ${data.nome_oficial},
        ${data.cnpj}, ${data.inscricao_estadual ?? null}, ${data.telefone ?? null}, ${data.email ?? null},
        ${data.cep}, ${data.logradouro}, ${data.numero}, ${data.complemento ?? null},
        ${data.referencia ?? null}, ${data.bairro ?? null}, ${data.cidade}, ${data.estado}, ${data.ativo}
      )
      RETURNING *
    `
    return dc
  },

  async update(sql: postgres.Sql, id: string, sellerId: string, data: UpdateDistributionCenterInput): Promise<DistributionCenterDB | null> {
    const updates: Record<string, any> = { ...data, updated_at: sql`NOW()` }
    for (const key of Object.keys(updates)) {
      if (updates[key] === undefined) delete updates[key]
    }
    
    const [dc] = await sql<DistributionCenterDB[]>`
      UPDATE distribution_centers
      SET ${sql(updates as any)}
      WHERE id = ${id} AND seller_id = ${sellerId} AND ativo = true
      RETURNING *
    `
    return dc ?? null
  },

  async delete(sql: postgres.Sql, id: string, sellerId: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM distribution_centers
      WHERE id = ${id} AND seller_id = ${sellerId}
    `
    return result.count > 0
  },
}
