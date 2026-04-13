import { z } from 'zod'

export const createExternalSystemSchema = z.object({
  sistema_nome: z.string().min(1, 'sistema_nome is required'),
  sistema_tipo: z.enum(['WMS', 'ERP', 'OMS', 'TMS']),
  base_url: z.string().optional(),
  auth_type: z.enum(['api_key', 'bearer_token', 'basic_auth', 'oauth2', 'custom']),
  api_key: z.string().optional(),
  token: z.string().optional(),
  usuario: z.string().optional(),
  senha_hash: z.string().optional(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  token_expires_at: z.string().datetime().optional().nullable(),
  extra_fields: z.record(z.any()).optional().nullable(),
  ativo: z.boolean().default(true).optional(),
})

export const updateExternalSystemSchema = createExternalSystemSchema.partial()

export const externalSystemParamsSchema = z.object({
  seller_id: z.string().uuid('Invalid seller ID format'),
  id: z.string().uuid('Invalid external system ID format').optional()
})

export type CreateExternalSystemBody = z.infer<typeof createExternalSystemSchema>
export type UpdateExternalSystemBody = z.infer<typeof updateExternalSystemSchema>
export type ExternalSystemParams = z.infer<typeof externalSystemParamsSchema>
