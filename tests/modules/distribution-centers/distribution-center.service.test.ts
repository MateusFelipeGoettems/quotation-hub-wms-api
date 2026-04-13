import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/modules/distribution-centers/distribution-center.repository', () => ({
  distributionCenterRepository: {
    findByIdAndSellerId: vi.fn(),
    findByOriginWarehouseCodeAndSellerId: vi.fn(),
    findAllBySellerId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { createDistributionCenterService } from '../../../src/modules/distribution-centers/distribution-center.service'
import { distributionCenterRepository } from '../../../src/modules/distribution-centers/distribution-center.repository'
import { ForbiddenError, NotFoundError, ConflictError } from '../../../src/shared/errors'

const mockSql = {} as any

describe('DistributionCenterService', () => {
  const service = createDistributionCenterService(mockSql)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('givenDifferentSellerId_WhenCreate_ShouldThrowForbidden', async () => {
      await expect(service.create('seller-1', 'seller-2', {} as any)).rejects.toThrow(ForbiddenError)
    })

    it('givenExistingOriginWarehouseCode_WhenCreate_ShouldThrowConflict', async () => {
      vi.mocked(distributionCenterRepository.findByOriginWarehouseCodeAndSellerId).mockResolvedValue({} as any)
      await expect(service.create('seller-1', 'seller-1', { origin_warehouse_code: 'WH1' } as any)).rejects.toThrow(ConflictError)
    })

    it('givenValidData_WhenCreate_ShouldReturnDistributionCenter', async () => {
      vi.mocked(distributionCenterRepository.findByOriginWarehouseCodeAndSellerId).mockResolvedValue(null)
      const mockResult = { id: 'dc-1' } as any
      vi.mocked(distributionCenterRepository.create).mockResolvedValue(mockResult)
      
      const payload = { origin_warehouse_code: 'WH1', nome_oficial: 'Test', cnpj: '12345678000199', cep: '00000-000', logradouro: 'Log', numero: '1', cidade: 'City', estado: 'SP' }
      const result = await service.create('seller-1', 'seller-1', payload as any)
      
      expect(result).toBe(mockResult)
      expect(distributionCenterRepository.create).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('givenDifferentSellerId_WhenGetById_ShouldThrowForbidden', async () => {
      await expect(service.getById('dc-1', 'seller-1', 'seller-2')).rejects.toThrow(ForbiddenError)
    })

    it('givenNonExistentDC_WhenGetById_ShouldThrowNotFound', async () => {
      vi.mocked(distributionCenterRepository.findByIdAndSellerId).mockResolvedValue(null)
      await expect(service.getById('dc-1', 'seller-1', 'seller-1')).rejects.toThrow(NotFoundError)
    })

    it('givenValidDC_WhenGetById_ShouldReturnDistributionCenter', async () => {
      const mockResult = { id: 'dc-1', ativo: true } as any
      vi.mocked(distributionCenterRepository.findByIdAndSellerId).mockResolvedValue(mockResult)
      const result = await service.getById('dc-1', 'seller-1', 'seller-1')
      expect(result).toBe(mockResult)
    })
  })

  describe('getAll', () => {
    it('givenDifferentSellerId_WhenGetAll_ShouldThrowForbidden', async () => {
      await expect(service.getAll('seller-1', 'seller-2')).rejects.toThrow(ForbiddenError)
    })

    it('givenValidSellerId_WhenGetAll_ShouldReturnArray', async () => {
      const mockResult = [{ id: 'dc-1' }] as any
      vi.mocked(distributionCenterRepository.findAllBySellerId).mockResolvedValue(mockResult)
      const result = await service.getAll('seller-1', 'seller-1')
      expect(result).toBe(mockResult)
    })
  })

  describe('update', () => {
    it('givenDifferentSellerId_WhenUpdate_ShouldThrowForbidden', async () => {
      await expect(service.update('dc-1', 'seller-1', 'seller-2', {} as any)).rejects.toThrow(ForbiddenError)
    })

    it('givenExistingOriginWarehouseCode_WhenUpdate_ShouldThrowConflict', async () => {
      vi.mocked(distributionCenterRepository.findByIdAndSellerId).mockResolvedValue({ origin_warehouse_code: 'WH1', ativo: true } as any)
      vi.mocked(distributionCenterRepository.findByOriginWarehouseCodeAndSellerId).mockResolvedValue({ id: 'dc-2' } as any)

      await expect(service.update('dc-1', 'seller-1', 'seller-1', { origin_warehouse_code: 'WH2' } as any)).rejects.toThrow(ConflictError)
    })

    it('givenValidData_WhenUpdate_ShouldReturnDistributionCenter', async () => {
      vi.mocked(distributionCenterRepository.findByIdAndSellerId).mockResolvedValue({ origin_warehouse_code: 'WH1', ativo: true } as any)
      const mockResult = { id: 'dc-1', origin_warehouse_code: 'WH1' } as any
      vi.mocked(distributionCenterRepository.update).mockResolvedValue(mockResult)
      
      const result = await service.update('dc-1', 'seller-1', 'seller-1', { nome_oficial: 'New Name' } as any)
      expect(result).toBe(mockResult)
    })
  })

  describe('remove', () => {
    it('givenDifferentSellerId_WhenRemove_ShouldThrowForbidden', async () => {
      await expect(service.remove('dc-1', 'seller-1', 'seller-2')).rejects.toThrow(ForbiddenError)
    })

    it('givenDeleteFails_WhenRemove_ShouldThrowNotFound', async () => {
      vi.mocked(distributionCenterRepository.delete).mockResolvedValue(false)
      await expect(service.remove('dc-1', 'seller-1', 'seller-1')).rejects.toThrow(NotFoundError)
    })

    it('givenValidData_WhenRemove_ShouldSucceed', async () => {
      vi.mocked(distributionCenterRepository.delete).mockResolvedValue(true)
      await expect(service.remove('dc-1', 'seller-1', 'seller-1')).resolves.toBeUndefined()
    })
  })
})
