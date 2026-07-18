import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'
import { buildCmsPaginationMeta } from '../common/dto/pagination.dto'

@Injectable()
export class ConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(page = 1, limit = 20, category?: string, isPublic?: boolean) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (category) where.category = category
    if (isPublic !== undefined) where.isPublic = isPublic

    const [data, total] = await Promise.all([
      this.prisma.cmsSetting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cmsSetting.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findOne(id: string) {
    const setting = await this.prisma.cmsSetting.findUnique({ where: { id } })
    if (!setting) throw new NotFoundException('Setting not found')
    return setting
  }

  async findByKey(key: string) {
    const setting = await this.prisma.cmsSetting.findUnique({ where: { key } })
    if (!setting) throw new NotFoundException(`Setting with key "${key}" not found`)
    return setting
  }

  async upsert(
    key: string,
    value: unknown,
    userId: string,
    description?: string,
    category?: string,
    isPublic?: boolean,
  ) {
    const existing = await this.prisma.cmsSetting.findUnique({ where: { key } })

    const setting = await this.prisma.cmsSetting.upsert({
      where: { key },
      create: {
        key,
        value: value as any,
        description: description ?? null,
        category: category ?? 'general',
        isPublic: isPublic ?? false,
      },
      update: {
        value: value as any,
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(isPublic !== undefined && { isPublic }),
      },
    })

    await this.auditService.log({
      entityType: 'CmsSetting',
      entityId: setting.id,
      action: existing ? 'UPDATE' : 'CREATE',
      userId,
      oldValue: existing ?? undefined,
      newValue: setting,
    })

    return setting
  }

  async update(
    id: string,
    data: {
      key?: string
      value?: unknown
      description?: string
      category?: string
      isPublic?: boolean
    },
    userId: string,
  ) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.cmsSetting.update({
      where: { id },
      data: {
        ...(data.key !== undefined && { key: data.key }),
        ...(data.value !== undefined && { value: data.value as any }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
    })

    await this.auditService.log({
      entityType: 'CmsSetting',
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

    await this.prisma.cmsSetting.delete({ where: { id } })

    await this.auditService.log({
      entityType: 'CmsSetting',
      entityId: id,
      action: 'DELETE',
      userId,
      oldValue: existing,
    })

    return { deleted: true }
  }

  async getPublic() {
    return this.prisma.cmsSetting.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getGameConfigs() {
    return this.prisma.gameConfig.findMany({
      orderBy: { updatedAt: 'desc' },
    })
  }
}
