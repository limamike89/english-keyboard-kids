import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'
import { buildCmsPaginationMeta } from '../common/dto/pagination.dto'

@Injectable()
export class NumbersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private getNumericFilter() {
    return {
      OR: [
        { letter: { in: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] } },
        { word: { contains: '0' } },
        { word: { contains: '1' } },
        { word: { contains: '2' } },
        { word: { contains: '3' } },
        { word: { contains: '4' } },
        { word: { contains: '5' } },
        { word: { contains: '6' } },
        { word: { contains: '7' } },
        { word: { contains: '8' } },
        { word: { contains: '9' } },
      ],
    }
  }

  async findAll(page = 1, limit = 20, search?: string, language?: string, isActive?: boolean) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {
      ...this.getNumericFilter(),
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { letter: { contains: search, mode: 'insensitive' } },
            { word: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    if (language) where.language = language
    if (isActive !== undefined) where.isActive = isActive

    const [data, total] = await Promise.all([
      this.prisma.wordBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ letter: 'asc' }, { order: 'asc' }],
      }),
      this.prisma.wordBank.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findOne(id: string) {
    const number = await this.prisma.wordBank.findUnique({ where: { id } })
    if (!number) throw new NotFoundException('Number not found')
    return number
  }

  async create(
    data: {
      letter: string
      word: string
      difficulty: string
      language: string
      description?: string
      imageUrl?: string
      audioUrl?: string
      categoryId?: string
      tags?: string[]
      order?: number
    },
    userId: string,
  ) {
    const number = await this.prisma.wordBank.create({
      data: {
        letter: data.letter,
        word: data.word,
        difficulty: data.difficulty as any,
        language: data.language ?? 'en',
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        audioUrl: data.audioUrl ?? null,
        categoryId: data.categoryId ?? null,
        tags: data.tags ?? [],
        order: data.order ?? 0,
      },
    })

    await this.auditService.log({
      entityType: 'Number',
      entityId: number.id,
      action: 'CREATE',
      userId,
      newValue: number,
    })

    return number
  }

  async update(
    id: string,
    data: {
      letter?: string
      word?: string
      difficulty?: string
      language?: string
      description?: string
      imageUrl?: string
      audioUrl?: string
      categoryId?: string
      tags?: string[]
      order?: number
    },
    userId: string,
  ) {
    const existing = await this.findOne(id)

    const updated = await this.prisma.wordBank.update({
      where: { id },
      data: {
        ...(data.letter !== undefined && { letter: data.letter }),
        ...(data.word !== undefined && { word: data.word }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty as any }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.order !== undefined && { order: data.order }),
      },
    })

    await this.auditService.log({
      entityType: 'Number',
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

    const updated = await this.prisma.wordBank.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    })

    await this.auditService.log({
      entityType: 'Number',
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

    const updated = await this.prisma.wordBank.update({
      where: { id },
      data: { isActive },
    })

    await this.auditService.log({
      entityType: 'Number',
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
