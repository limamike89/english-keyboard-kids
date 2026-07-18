import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'
import { buildCmsPaginationMeta } from '../common/dto/pagination.dto'

@Injectable()
export class LevelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string, mode?: string, language?: string, isActive?: boolean) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (mode) where.mode = mode
    if (language) where.language = language
    if (isActive !== undefined) where.isActive = isActive

    const [data, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ mode: 'asc' }, { level: 'asc' }, { order: 'asc' }],
      }),
      this.prisma.lesson.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findOne(id: string) {
    const level = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    })
    if (!level) throw new NotFoundException('Level not found')
    return level
  }

  async create(
    data: {
      mode: string
      language?: string
      title?: string
      description?: string
      level?: number
      order?: number
      questionCount?: number
      isActive?: boolean
    },
    userId: string,
  ) {
    const level = await this.prisma.lesson.create({
      data: {
        mode: data.mode as any,
        language: data.language ?? 'en',
        title: data.title ?? `Level ${data.level ?? 1}`,
        description: data.description ?? null,
        level: data.level ?? 1,
        order: data.order ?? 0,
        questionCount: data.questionCount ?? 10,
        isActive: data.isActive ?? true,
      },
    })

    await this.auditService.log({
      entityType: 'Lesson',
      entityId: level.id,
      action: 'CREATE',
      userId,
      newValue: level,
    })

    return level
  }

  async update(
    id: string,
    data: {
      mode?: string
      language?: string
      title?: string
      description?: string
      level?: number
      order?: number
      questionCount?: number
      isActive?: boolean
    },
    userId: string,
  ) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        ...(data.mode !== undefined && { mode: data.mode as any }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.questionCount !== undefined && { questionCount: data.questionCount }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    await this.auditService.log({
      entityType: 'Lesson',
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

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await this.auditService.log({
      entityType: 'Lesson',
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

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: { isActive },
    })

    await this.auditService.log({
      entityType: 'Lesson',
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
