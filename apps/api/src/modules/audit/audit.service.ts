import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

export interface AuditEntry {
  entityType: string
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  fieldName?: string
  oldValue?: unknown
  newValue?: unknown
  userId?: string
  reason?: string
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry) {
    return this.prisma.cmsChangeLog.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        fieldName: entry.fieldName ?? null,
        oldValue: entry.oldValue as Prisma.InputJsonValue ?? Prisma.DbNull,
        newValue: entry.newValue as Prisma.InputJsonValue ?? Prisma.DbNull,
        userId: entry.userId ?? null,
        reason: entry.reason ?? null,
      },
    })
  }

  async findAll(params: {
    page?: number
    limit?: number
    entityType?: string
    entityId?: string
    userId?: string
    action?: string
    startDate?: string
    endDate?: string
  }) {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    const where: Prisma.CmsChangeLogWhereInput = {}
    if (params.entityType) where.entityType = params.entityType
    if (params.entityId) where.entityId = params.entityId
    if (params.userId) where.userId = params.userId
    if (params.action) where.action = params.action
    if (params.startDate || params.endDate) {
      where.createdAt = {}
      if (params.startDate) where.createdAt.gte = new Date(params.startDate)
      if (params.endDate) where.createdAt.lte = new Date(params.endDate)
    }

    const [data, total] = await Promise.all([
      this.prisma.cmsChangeLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, displayName: true, email: true } },
        },
      }),
      this.prisma.cmsChangeLog.count({ where }),
    ])

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
