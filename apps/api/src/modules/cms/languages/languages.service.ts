import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'
import { buildCmsPaginationMeta } from '../common/dto/pagination.dto'

@Injectable()
export class LanguagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(page = 1, limit = 20, search?: string, isActive?: boolean) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { nativeName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (isActive !== undefined) where.isActive = isActive

    const [data, total] = await Promise.all([
      this.prisma.language.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      this.prisma.language.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findOne(id: string) {
    const language = await this.prisma.language.findUnique({ where: { id } })
    if (!language) throw new NotFoundException('Language not found')
    return language
  }

  async create(
    data: {
      code: string
      name: string
      nativeName?: string
      flag?: string
      direction?: string
      isActive?: boolean
      isDefault?: boolean
      order?: number
    },
    userId: string,
  ) {
    const language = await this.prisma.language.create({
      data: {
        code: data.code,
        name: data.name,
        nativeName: data.nativeName ?? null,
        flag: data.flag ?? null,
        direction: data.direction ?? 'ltr',
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
        order: data.order ?? 0,
      },
    })

    await this.auditService.log({
      entityType: 'Language',
      entityId: language.id,
      action: 'CREATE',
      userId,
      newValue: language,
    })

    return language
  }

  async update(
    id: string,
    data: {
      code?: string
      name?: string
      nativeName?: string
      flag?: string
      direction?: string
      isActive?: boolean
      isDefault?: boolean
      order?: number
    },
    userId: string,
  ) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.language.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nativeName !== undefined && { nativeName: data.nativeName }),
        ...(data.flag !== undefined && { flag: data.flag }),
        ...(data.direction !== undefined && { direction: data.direction }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.order !== undefined && { order: data.order }),
      },
    })

    await this.auditService.log({
      entityType: 'Language',
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

    const updated = await this.prisma.language.update({
      where: { id },
      data: { isActive: false },
    })

    await this.auditService.log({
      entityType: 'Language',
      entityId: id,
      action: 'DELETE',
      userId,
      oldValue: existing,
      newValue: updated,
    })

    return updated
  }

  async setDefault(id: string, userId: string) {
    const existing = await this.findOne(id)

    await this.prisma.language.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })

    const updated = await this.prisma.language.update({
      where: { id },
      data: { isDefault: true },
    })

    await this.auditService.log({
      entityType: 'Language',
      entityId: id,
      action: 'UPDATE',
      fieldName: 'isDefault',
      userId,
      oldValue: { isDefault: existing.isDefault },
      newValue: { isDefault: true },
    })

    return updated
  }

  async toggleStatus(id: string, isActive: boolean, userId: string) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.language.update({
      where: { id },
      data: { isActive },
    })

    await this.auditService.log({
      entityType: 'Language',
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
