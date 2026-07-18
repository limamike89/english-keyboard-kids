import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'
import { buildCmsPaginationMeta } from '../common/dto/pagination.dto'

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string, category?: string, isActive?: boolean) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) where.category = category
    if (isActive !== undefined) where.isActive = isActive

    const [data, total] = await Promise.all([
      this.prisma.achievement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.achievement.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findOne(id: string) {
    const achievement = await this.prisma.achievement.findUnique({ where: { id } })
    if (!achievement) throw new NotFoundException('Achievement not found')
    return achievement
  }

  async create(
    data: {
      key?: string
      name: string
      description: string
      icon?: string
      iconUrl?: string
      category?: string
      group?: string
      criteria?: Record<string, unknown>
      rules?: Record<string, unknown>
      xpReward?: number
      coinsReward?: number
      maxProgress?: number
      isActive?: boolean
    },
    userId: string,
  ) {
    const key = data.key ?? data.name.toUpperCase().replace(/\s+/g, '_')

    const achievement = await this.prisma.achievement.create({
      data: {
        key,
        name: data.name,
        description: data.description,
        icon: data.icon ?? 'star',
        iconUrl: data.iconUrl ?? null,
        category: (data.category ?? 'SPECIAL') as any,
        group: data.group ?? null,
        criteria: (data.criteria ?? {}) as any,
        rules: (data.rules ?? undefined) as any,
        xpReward: data.xpReward ?? 0,
        coinsReward: data.coinsReward ?? 0,
        maxProgress: data.maxProgress ?? 1,
        isActive: data.isActive ?? true,
      },
    })

    await this.auditService.log({
      entityType: 'Achievement',
      entityId: achievement.id,
      action: 'CREATE',
      userId,
      newValue: achievement,
    })

    return achievement
  }

  async update(
    id: string,
    data: {
      key?: string
      name?: string
      description?: string
      icon?: string
      iconUrl?: string
      category?: string
      group?: string
      criteria?: Record<string, unknown>
      rules?: Record<string, unknown>
      xpReward?: number
      coinsReward?: number
      maxProgress?: number
      isActive?: boolean
    },
    userId: string,
  ) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.achievement.update({
      where: { id },
      data: {
        ...(data.key !== undefined && { key: data.key }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.iconUrl !== undefined && { iconUrl: data.iconUrl }),
        ...(data.category !== undefined && { category: data.category as any }),
        ...(data.group !== undefined && { group: data.group }),
        ...(data.criteria !== undefined && { criteria: data.criteria as any }),
        ...(data.rules !== undefined && { rules: data.rules as any }),
        ...(data.xpReward !== undefined && { xpReward: data.xpReward }),
        ...(data.coinsReward !== undefined && { coinsReward: data.coinsReward }),
        ...(data.maxProgress !== undefined && { maxProgress: data.maxProgress }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    await this.auditService.log({
      entityType: 'Achievement',
      entityId: id,
      action: 'UPDATE',
      userId,
      oldValue: existing,
      newValue: updated,
    })

    return updated
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.achievement.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await this.auditService.log({
      entityType: 'Achievement',
      entityId: id,
      action: 'DELETE',
      userId,
      oldValue: existing,
      newValue: updated,
    })

    return updated
  }

  async toggleStatus(id: string, isActive: boolean, userId: string) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.achievement.update({
      where: { id },
      data: { isActive },
    })

    await this.auditService.log({
      entityType: 'Achievement',
      entityId: id,
      action: 'UPDATE',
      fieldName: 'isActive',
      userId,
      oldValue: { isActive: existing.isActive },
      newValue: { isActive },
    })

    return updated
  }
}
