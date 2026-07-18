import { Test, TestingModule } from '@nestjs/testing'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { Reflector } from '@nestjs/core'
import { ForbiddenException } from '@nestjs/common'
import { AuditService } from '../../audit/audit.service'

describe('CmsRoleGuard', () => {
  let guard: CmsRoleGuard
  let reflector: Reflector

  beforeEach(async () => {
    reflector = new Reflector()
    guard = new CmsRoleGuard(reflector)
  })

  function mockContext(metadata: Record<string, unknown>, userRoles: string[]): any {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(metadata.value)
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { roles: userRoles },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({ getData: () => ({}) }),
      switchToWs: () => ({ getData: () => ({}) }),
      getType: () => 'http',
    }
  }

  it('should allow access when no roles required', () => {
    const ctx = mockContext({ value: undefined }, ['VIEWER'])
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should allow access when user has required role', () => {
    const ctx = mockContext({ value: ['ADMIN'] }, ['ADMIN'])
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should allow access when user has one of multiple required roles', () => {
    const ctx = mockContext({ value: ['ADMIN', 'EDITOR'] }, ['EDITOR'])
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should deny access when user lacks required role', () => {
    const ctx = mockContext({ value: ['ADMIN'] }, ['EDITOR'])
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it('should deny access when user has no roles', () => {
    const ctx = mockContext({ value: ['ADMIN'] }, [])
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })

  it('should deny access when request has no user', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({ getData: () => ({}) }),
      switchToWs: () => ({ getData: () => ({}) }),
      getType: () => 'http',
    } as any
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN'])
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException)
  })
})

describe('AuditService', () => {
  let service: AuditService
  let prismaMock: any

  beforeEach(async () => {
    prismaMock = {
      cmsChangeLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    }
    service = new AuditService(prismaMock as any)
  })

  it('should create audit log entry', async () => {
    const entry = {
      entityType: 'WordBank',
      entityId: '123',
      action: 'CREATE' as const,
      newValue: { word: 'apple' },
      userId: 'user-1',
    }

    prismaMock.cmsChangeLog.create.mockResolvedValue({ id: 'log-1', ...entry })

    const result = await service.log(entry)

    expect(prismaMock.cmsChangeLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: 'WordBank',
        entityId: '123',
        action: 'CREATE',
        userId: 'user-1',
      }),
    })
    expect(result.id).toBe('log-1')
  })

  it('should list audit logs with pagination', async () => {
    prismaMock.cmsChangeLog.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }])
    prismaMock.cmsChangeLog.count.mockResolvedValue(10)

    const result = await service.findAll({ page: 1, limit: 2 })

    expect(result.data).toHaveLength(2)
    expect(result.meta.total).toBe(10)
    expect(result.meta.totalPages).toBe(5)
  })

  it('should filter audit logs by entity type', async () => {
    await service.findAll({ entityType: 'WordBank' })

    expect(prismaMock.cmsChangeLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ entityType: 'WordBank' }),
      }),
    )
  })

  it('should filter audit logs by date range', async () => {
    await service.findAll({ startDate: '2024-01-01', endDate: '2024-12-31' })

    const callArgs = prismaMock.cmsChangeLog.findMany.mock.calls[0][0]
    expect(callArgs.where.createdAt).toBeDefined()
    expect(callArgs.where.createdAt.gte).toBeInstanceOf(Date)
    expect(callArgs.where.createdAt.lte).toBeInstanceOf(Date)
  })
})

describe('ImportExportService', () => {
  let service: any
  let prismaMock: any
  let auditServiceMock: any

  beforeEach(async () => {
    prismaMock = {
      wordBank: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }

    auditServiceMock = { log: jest.fn() }

    const { ImportExportService } = require('../../import-export/import-export.service')
    service = new ImportExportService(prismaMock, auditServiceMock)
  })

  describe('importWords', () => {
    it('should create new words from JSON data', async () => {
      prismaMock.wordBank.findFirst.mockResolvedValue(null)
      prismaMock.wordBank.create.mockResolvedValue({ id: 'new-word' })

      const data = [{ word: 'apple', letter: 'A', language: 'en', difficulty: 'BEGINNER' }]
      const result = await service.importWords(data, 'user-1')

      expect(result.created).toBe(1)
      expect(result.errors).toBe(0)
      expect(prismaMock.wordBank.create).toHaveBeenCalled()
    })

    it('should update existing words', async () => {
      prismaMock.wordBank.findFirst.mockResolvedValue({ id: 'existing', level: 1, order: 0 })
      prismaMock.wordBank.update.mockResolvedValue({ id: 'existing' })

      const data = [{ word: 'apple', letter: 'A', language: 'en', difficulty: 'INTERMEDIATE' }]
      const result = await service.importWords(data, 'user-1')

      expect(result.updated).toBe(1)
      expect(result.created).toBe(0)
      expect(prismaMock.wordBank.update).toHaveBeenCalled()
    })

    it('should skip rows with empty word', async () => {
      const data = [{ word: '', letter: 'A' }]
      const result = await service.importWords(data, 'user-1')

      expect(result.errors).toBe(1)
      expect(result.created).toBe(0)
    })
  })

  describe('importCategories', () => {
    it('should create new categories', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null)
      prismaMock.category.create.mockResolvedValue({ id: 'new-cat' })

      const data = [{ name: 'Animals', slug: 'animals' }]
      const result = await service.importCategories(data, 'user-1')

      expect(result.created).toBe(1)
      expect(prismaMock.category.create).toHaveBeenCalled()
    })

    it('should skip rows with empty name', async () => {
      const data = [{ name: '' }]
      const result = await service.importCategories(data, 'user-1')

      expect(result.errors).toBe(1)
    })
  })

  describe('exportWords', () => {
    it('should export words with category info', async () => {
      prismaMock.wordBank.findMany.mockResolvedValue([
        {
          letter: 'A', word: 'apple', language: 'en', difficulty: 'BEGINNER',
          level: 1, order: 0, isActive: true, tags: [],
          description: null, category: { name: 'Fruits', slug: 'fruits' },
        },
      ])

      const result = await service.exportWords({})

      expect(result).toHaveLength(1)
      expect(result[0].word).toBe('apple')
      expect(result[0].category).toBe('Fruits')
    })
  })

  describe('exportCategories', () => {
    it('should export categories with filters', async () => {
      prismaMock.category.findMany.mockResolvedValue([
        { id: '1', name: 'Animals', slug: 'animals', language: 'en', isActive: true },
      ])

      const result = await service.exportCategories({ language: 'en' })

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Animals')
      expect(prismaMock.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ language: 'en' }),
        }),
      )
    })
  })
})
