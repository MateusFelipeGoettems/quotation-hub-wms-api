import type postgres from 'postgres'

export interface ExternalSystemDB {
  id: string
  seller_id: string
  sistema_nome: string
  sistema_tipo: 'WMS' | 'ERP' | 'OMS' | 'TMS'
  base_url: string | null
  auth_type: 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'custom'
  api_key: string | null
  token: string | null
  usuario: string | null
  senha_hash: string | null
  client_id: string | null
  client_secret: string | null
  token_expires_at: Date | null
  extra_fields: Record<string, any> | null
  ativo: boolean
  created_at: Date
  updated_at: Date
}

export type CreateExternalSystemInput = Omit<ExternalSystemDB, 'id' | 'created_at' | 'updated_at'>
export type UpdateExternalSystemInput = Partial<CreateExternalSystemInput>

export const externalSystemRepository = {
  async findByIdAndSellerId(sql: postgres.Sql, id: string, sellerId: string): Promise<ExternalSystemDB | null> {
    const [system] = await sql<ExternalSystemDB[]>`
      SELECT *
      FROM external_systems
      WHERE id = ${id} AND seller_id = ${sellerId}
    `
    return system ?? null
  },

  async findAllBySellerId(sql: postgres.Sql, sellerId: string): Promise<ExternalSystemDB[]> {
    return sql<ExternalSystemDB[]>`
      SELECT *
      FROM external_systems
      WHERE seller_id = ${sellerId} AND ativo = true
    `
  },

  async create(sql: postgres.Sql, data: CreateExternalSystemInput): Promise<ExternalSystemDB> {
    const [system] = await sql<ExternalSystemDB[]>`
      INSERT INTO external_systems (
        seller_id, sistema_nome, sistema_tipo, base_url, auth_type,
        api_key, token, usuario, senha_hash, client_id, client_secret,
        token_expires_at, extra_fields, ativo
      ) VALUES (
        ${data.seller_id}, ${data.sistema_nome}, ${data.sistema_tipo}, ${data.base_url ?? null}, ${data.auth_type},
        ${data.api_key ?? null}, ${data.token ?? null}, ${data.usuario ?? null}, ${data.senha_hash ?? null}, ${data.client_id ?? null}, ${data.client_secret ?? null},
        ${data.token_expires_at ?? null}, ${data.extra_fields ? sql.json(data.extra_fields) : null}, ${data.ativo}
      )
      RETURNING *
    `
    return system
  },

  async update(sql: postgres.Sql, id: string, sellerId: string, data: UpdateExternalSystemInput): Promise<ExternalSystemDB | null> {
    const updates: Record<string, any> = { ...data, updated_at: sql\`NOW()\` }
    
    // Convert undefined to delete
    for (const key of Object.keys(updates)) {
      if (updates[key] === undefined) {
        delete updates[key]
      } else if (key === 'extra_fields' && updates[key] !== null) {
        // format jsonb
        updates[key] = sql.json(updates[key])
      }
    }
    
    const [system] = await sql<ExternalSystemDB[]>`
      UPDATE external_systems
      SET \${sql(updates as any)}
      WHERE id = ${id} AND seller_id = ${sellerId} AND ativo = true
      RETURNING *
    `
    return system ?? null
  },

  async delete(sql: postgres.Sql, id: string, sellerId: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM external_systems
      WHERE id = ${id} AND seller_id = ${sellerId}
    `
    return result.count > 0
  },
}
