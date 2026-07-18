import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'
import { buildCmsPaginationMeta } from '../common/dto/pagination.dto'

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string, language?: string, isActive?: boolean) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (language) where.language = language
    if (isActive !== undefined) where.isActive = isActive

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')
    return category
  }

  async create(
    data: {
      name: string
      slug?: string
      description?: string
      icon?: string
      color?: string
      language?: string
      order?: number
    },
    userId: string,
  ) {
    const slug = data.slug ?? data.name.toLowerCase().replace(/\s+/g, '-')

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        icon: data.icon ?? null,
        color: data.color ?? null,
        language: data.language ?? 'en',
        order: data.order ?? 0,
      },
    })

    await this.auditService.log({
      entityType: 'Category',
      entityId: category.id,
      action: 'CREATE',
      userId,
      newValue: category,
    })

    return category
  }

  async update(
    id: string,
    data: {
      name?: string
      slug?: string
      description?: string
      icon?: string
      color?: string
      language?: string
      order?: number
    },
    userId: string,
  ) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.order !== undefined && { order: data.order }),
      },
    })

    await this.auditService.log({
      entityType: 'Category',
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

    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    })

    await this.auditService.log({
      entityType: 'Category',
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

    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive },
    })

    await this.auditService.log({
      entityType: 'Category',
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
