import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/modules/external-systems/external-system.repository', () => ({
  externalSystemRepository: {
    findByIdAndSellerId: vi.fn(),
    findAllBySellerId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { createExternalSystemService } from '../../../src/modules/external-systems/external-system.service'
import { externalSystemRepository } from '../../../src/modules/external-systems/external-system.repository'
import { ForbiddenError, NotFoundError } from '../../../src/shared/errors'

const mockSql = {} as any

describe('ExternalSystemService', () => {
  const service = createExternalSystemService(mockSql)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('givenDifferentSellerId_WhenCreate_ShouldThrowForbidden', async () => {
      await expect(service.create('seller-1', 'seller-2', {} as any)).rejects.toThrow(ForbiddenError)
    })

    it('givenValidData_WhenCreate_ShouldReturnExternalSystemWithoutSecrets', async () => {
      const mockResult = { id: 'sys-1', senha_hash: 'hash', client_secret: 'secret', token: 'token1', sistema_nome: 'Test', ativo: true } as any
      vi.mocked(externalSystemRepository.create).mockResolvedValue(mockResult)
      
      const payload = { sistema_nome: 'Test', sistema_tipo: 'WMS', auth_type: 'api_key' }
      const result = await service.create('seller-1', 'seller-1', payload as any)
      
      expect(result).not.toHaveProperty('senha_hash')
      expect(result).not.toHaveProperty('client_secret')
      expect(result).not.toHaveProperty('token')
      expect(result.sistema_nome).toBe('Test')
      expect(externalSystemRepository.create).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('givenDifferentSellerId_WhenGetById_ShouldThrowForbidden', async () => {
      await expect(service.getById('sys-1', 'seller-1', 'seller-2')).rejects.toThrow(ForbiddenError)
    })

    it('givenNonExistentSystem_WhenGetById_ShouldThrowNotFound', async () => {
      vi.mocked(externalSystemRepository.findByIdAndSellerId).mockResolvedValue(null)
      await expect(service.getById('sys-1', 'seller-1', 'seller-1')).rejects.toThrow(NotFoundError)
    })

    it('givenValidSystem_WhenGetById_ShouldReturnWithoutSecrets', async () => {
      const mockResult = { id: 'sys-1', ativo: true, senha_hash: 'hash' } as any
      vi.mocked(externalSystemRepository.findByIdAndSellerId).mockResolvedValue(mockResult)
      const result = await service.getById('sys-1', 'seller-1', 'seller-1')
      expect(result).not.toHaveProperty('senha_hash')
    })
  })

  describe('getAll', () => {
    it('givenDifferentSellerId_WhenGetAll_ShouldThrowForbidden', async () => {
      await expect(service.getAll('seller-1', 'seller-2')).rejects.toThrow(ForbiddenError)
    })

    it('givenValidSellerId_WhenGetAll_ShouldReturnArrayWithoutSecrets', async () => {
      const mockResult = [{ id: 'sys-1', senha_hash: 'hash' }] as any
      vi.mocked(externalSystemRepository.findAllBySellerId).mockResolvedValue(mockResult)
      const result = await service.getAll('seller-1', 'seller-1')
      expect(result[0]).not.toHaveProperty('senha_hash')
    })
  })

  describe('update', () => {
    it('givenDifferentSellerId_WhenUpdate_ShouldThrowForbidden', async () => {
      await expect(service.update('sys-1', 'seller-1', 'seller-2', {} as any)).rejects.toThrow(ForbiddenError)
    })

    it('givenNonExistentSystem_WhenUpdate_ShouldThrowNotFound', async () => {
      vi.mocked(externalSystemRepository.findByIdAndSellerId).mockResolvedValue(null)
      await expect(service.update('sys-1', 'seller-1', 'seller-1', {} as any)).rejects.toThrow(NotFoundError)
    })

    it('givenValidData_WhenUpdate_ShouldReturnWithoutSecrets', async () => {
      vi.mocked(externalSystemRepository.findByIdAndSellerId).mockResolvedValue({ id: 'sys-1', ativo: true } as any)
      const mockResult = { id: 'sys-1', sistema_nome: 'Updated Name', senha_hash: 'hash', ativo: true } as any
      vi.mocked(externalSystemRepository.update).mockResolvedValue(mockResult)
      
      const result = await service.update('sys-1', 'seller-1', 'seller-1', { sistema_nome: 'Updated Name' } as any)
      expect(result).not.toHaveProperty('senha_hash')
      expect(result.sistema_nome).toBe('Updated Name')
    })
  })

  describe('remove', () => {
    it('givenDifferentSellerId_WhenRemove_ShouldThrowForbidden', async () => {
      await expect(service.remove('sys-1', 'seller-1', 'seller-2')).rejects.toThrow(ForbiddenError)
    })

    it('givenDeleteFails_WhenRemove_ShouldThrowNotFound', async () => {
      vi.mocked(externalSystemRepository.delete).mockResolvedValue(false)
      await expect(service.remove('sys-1', 'seller-1', 'seller-1')).rejects.toThrow(NotFoundError)
    })

    it('givenValidData_WhenRemove_ShouldSucceed', async () => {
      vi.mocked(externalSystemRepository.delete).mockResolvedValue(true)
      await expect(service.remove('sys-1', 'seller-1', 'seller-1')).resolves.toBeUndefined()
    })
  })
})
