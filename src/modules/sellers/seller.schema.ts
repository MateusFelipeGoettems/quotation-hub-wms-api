import { z } from 'zod'

export const createSellerSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome is required')
    .max(100, 'Nome must be at most 100 characters'),
  cnpj: z
    .string()
    .min(14, 'CNPJ inválido')
    .max(18, 'CNPJ inválido'),
})

export const updateSellerSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome must not be empty')
    .max(255, 'Nome must be at most 255 characters')
    .optional(),
})

export const sellerParamsSchema = z.object({
  id: z.string().uuid('Invalid seller ID format'),
})

export type CreateSellerBody = z.infer<typeof createSellerSchema>
export type UpdateSellerBody = z.infer<typeof updateSellerSchema>
export type SellerParams = z.infer<typeof sellerParamsSchema>
