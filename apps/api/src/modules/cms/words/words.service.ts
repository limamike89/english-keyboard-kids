import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { AuditService } from '../../audit/audit.service'
import { buildCmsPaginationMeta } from '../common/dto/pagination.dto'

@Injectable()
export class WordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    filters?: {
      search?: string
      language?: string
      categoryId?: string
      letter?: string
      difficulty?: string
      isActive?: boolean
    },
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}

    if (filters?.search) {
      where.OR = [
        { word: { contains: filters.search, mode: 'insensitive' } },
        { letter: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.language) where.language = filters.language
    if (filters?.categoryId) where.categoryId = filters.categoryId
    if (filters?.letter) where.letter = filters.letter
    if (filters?.difficulty) where.difficulty = filters.difficulty
    if (filters?.isActive !== undefined) where.isActive = filters.isActive

    const [data, total] = await Promise.all([
      this.prisma.wordBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ letter: 'asc' }, { order: 'asc' }],
        include: { category: true },
      }),
      this.prisma.wordBank.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findOne(id: string) {
    const word = await this.prisma.wordBank.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!word) throw new NotFoundException('Word not found')
    return word
  }

  async findByCategory(categoryId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where = { categoryId }

    const [data, total] = await Promise.all([
      this.prisma.wordBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
        include: { category: true },
      }),
      this.prisma.wordBank.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findByLetter(letter: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where = { letter }

    const [data, total] = await Promise.all([
      this.prisma.wordBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }],
        include: { category: true },
      }),
      this.prisma.wordBank.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
  }

  async findByTag(tag: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const where = { tags: { has: tag } }

    const [data, total] = await Promise.all([
      this.prisma.wordBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }],
        include: { category: true },
      }),
      this.prisma.wordBank.count({ where }),
    ])

    return {
      data,
      meta: buildCmsPaginationMeta(total, page, limit),
    }
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
    const word = await this.prisma.wordBank.create({
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
      entityType: 'Word',
      entityId: word.id,
      action: 'CREATE',
      userId,
      newValue: word,
    })

    return word
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
      entityType: 'Word',
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
      entityType: 'Word',
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
      entityType: 'Word',
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
