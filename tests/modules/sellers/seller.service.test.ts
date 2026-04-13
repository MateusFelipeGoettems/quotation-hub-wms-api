import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the repository before importing service
vi.mock('../../../src/modules/sellers/seller.repository', () => ({
  sellerRepository: {
    findById: vi.fn(),
    findByApiKey: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}))

// Mock crypto for predictable api_key
vi.mock('node:crypto', () => ({
  randomUUID: () => 'test-uuid-1234-5678-abcdefgh',
}))

import { createSellerService } from '../../../src/modules/sellers/seller.service'
import { sellerRepository } from '../../../src/modules/sellers/seller.repository'
import { ForbiddenError, NotFoundError } from '../../../src/shared/errors'

const mockSql = {} as any

describe('SellerService', () => {
  const service = createSellerService(mockSql)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('shouldCreateSellerAndReturnFullApiKey', async () => {
      const mockSeller = {
        id: 'seller-1',
        nome: 'Test Seller',
        cnpj: '12345678000199',
        api_key: 'test-uuid-1234-5678-abcdefgh',
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(sellerRepository.create).mockResolvedValue(mockSeller)

      const result = await service.create({ nome: 'Test Seller', cnpj: '12345678000199' })

      expect(result.api_key).toBe('test-uuid-1234-5678-abcdefgh')
      expect(result.nome).toBe('Test Seller')
      expect(result.cnpj).toBe('12345678000199')
      expect(sellerRepository.create).toHaveBeenCalledWith(mockSql, {
        nome: 'Test Seller',
        cnpj: '12345678000199',
        api_key: 'test-uuid-1234-5678-abcdefgh',
      })
    })
  })

  describe('getById', () => {
    it('shouldReturnSellerWithMaskedApiKeyWhenOwnerAccesses', async () => {
      const mockSeller = {
        id: 'seller-1',
        nome: 'Test Seller',
        cnpj: '12345678000199',
        api_key: 'my-secret-api-key-a1b2',
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(sellerRepository.findById).mockResolvedValue(mockSeller)

      const result = await service.getById('seller-1', 'seller-1')

      expect(result.api_key).toBe('****a1b2')
      expect(result.nome).toBe('Test Seller')
      expect(result.cnpj).toBe('12345678000199')
    })

    it('shouldThrow403WhenSellerTriesToAccessAnotherSeller', async () => {
      await expect(
        service.getById('seller-1', 'seller-999')
      ).rejects.toThrow(ForbiddenError)

      expect(sellerRepository.findById).not.toHaveBeenCalled()
    })

    it('shouldThrow404WhenSellerNotFound', async () => {
      vi.mocked(sellerRepository.findById).mockResolvedValue(null)

      await expect(
        service.getById('seller-1', 'seller-1')
      ).rejects.toThrow(NotFoundError)
    })

    it('shouldThrow404WhenSellerIsInactive', async () => {
      vi.mocked(sellerRepository.findById).mockResolvedValue({
        id: 'seller-1',
        nome: 'Inactive',
        cnpj: '12345678000199',
        api_key: 'key',
        ativo: false,
        created_at: new Date(),
        updated_at: new Date(),
      })

      await expect(
        service.getById('seller-1', 'seller-1')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('update', () => {
    it('shouldUpdateSellerDataWhenOwnerRequests', async () => {
      const mockSeller = {
        id: 'seller-1',
        nome: 'Updated Name',
        cnpj: '12345678000199',
        api_key: 'secret-key',
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      vi.mocked(sellerRepository.update).mockResolvedValue(mockSeller)

      const result = await service.update('seller-1', { nome: 'Updated Name' }, 'seller-1')

      expect(result.nome).toBe('Updated Name')
      expect(result.cnpj).toBe('12345678000199')
      expect(result.api_key).toBe('****-key')
    })

    it('shouldThrow403WhenNonOwnerTriesToUpdate', async () => {
      await expect(
        service.update('seller-1', { nome: 'Hacked' }, 'seller-999')
      ).rejects.toThrow(ForbiddenError)

      expect(sellerRepository.update).not.toHaveBeenCalled()
    })

    it('shouldThrow404WhenUpdatingNonExistentSeller', async () => {
      vi.mocked(sellerRepository.update).mockResolvedValue(null)

      await expect(
        service.update('seller-1', { nome: 'X' }, 'seller-1')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('remove', () => {
    it('shouldSoftDeleteSellerWhenOwnerRequests', async () => {
      vi.mocked(sellerRepository.softDelete).mockResolvedValue(true)

      await expect(service.remove('seller-1', 'seller-1')).resolves.toBeUndefined()

      expect(sellerRepository.softDelete).toHaveBeenCalledWith(mockSql, 'seller-1')
    })

    it('shouldThrow403WhenNonOwnerTriesToDelete', async () => {
      await expect(
        service.remove('seller-1', 'seller-999')
      ).rejects.toThrow(ForbiddenError)

      expect(sellerRepository.softDelete).not.toHaveBeenCalled()
    })

    it('shouldThrow404WhenDeletingNonExistentSeller', async () => {
      vi.mocked(sellerRepository.softDelete).mockResolvedValue(false)

      await expect(
        service.remove('seller-1', 'seller-1')
      ).rejects.toThrow(NotFoundError)
    })
  })
})
