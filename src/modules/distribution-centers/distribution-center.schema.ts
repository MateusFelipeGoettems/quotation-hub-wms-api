import { z } from 'zod'

export const createDistributionCenterSchema = z.object({
  tms_id: z.string().optional(),
  origin_warehouse_code: z.string().min(1, 'origin_warehouse_code is required'),
  nome_oficial: z.string().min(1, 'nome_oficial is required').max(44, 'nome_oficial must be at most 44 characters'),
  cnpj: z.string().min(14, 'cnpj is required'),
  inscricao_estadual: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('email must be valid').optional().or(z.literal('')),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'cep format must be 00000-000'),
  logradouro: z.string().min(1, 'logradouro is required'),
  numero: z.string().min(1, 'numero is required'),
  complemento: z.string().max(20, 'complemento must be at most 20 characters').optional(),
  referencia: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().min(1, 'cidade is required'),
  estado: z.string().length(2, 'estado must be exactly 2 characters'),
  ativo: z.boolean().default(true).optional()
})

export const updateDistributionCenterSchema = createDistributionCenterSchema.partial()

export const distributionCenterParamsSchema = z.object({
  seller_id: z.string().uuid('Invalid seller ID format'),
  id: z.string().uuid('Invalid distribution center ID format').optional()
})

export type CreateDistributionCenterBody = z.infer<typeof createDistributionCenterSchema>
export type UpdateDistributionCenterBody = z.infer<typeof updateDistributionCenterSchema>
export type DistributionCenterParams = z.infer<typeof distributionCenterParamsSchema>
