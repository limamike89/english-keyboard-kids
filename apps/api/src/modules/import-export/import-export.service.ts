import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../../modules/audit/audit.service'

@Injectable()
export class ImportExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async importWords(data: Array<Record<string, unknown>>, userId: string) {
    const results = { created: 0, updated: 0, errors: 0, errorDetails: [] as string[] }

    for (const row of data) {
      try {
        const word = String(row.word || '').trim()
        if (!word) {
          results.errors++
          continue
        }

        const letter = String(row.letter || word.charAt(0).toUpperCase()).toUpperCase()
        const language = String(row.language || 'en')
        const difficulty = String(row.difficulty || 'BEGINNER')
        const categorySlug = row.category ? String(row.category).toLowerCase().replace(/\s+/g, '-') : undefined

        let categoryId: string | undefined
        if (categorySlug) {
          const cat = await this.prisma.category.findUnique({ where: { slug: categorySlug } })
          if (cat) categoryId = cat.id
        }

        const existing = await this.prisma.wordBank.findFirst({
          where: { word, language },
        })

        if (existing) {
          await this.prisma.wordBank.update({
            where: { id: existing.id },
            data: {
              letter,
              difficulty: difficulty as never,
              categoryId,
              description: String(row.description || '') || undefined,
              tags: row.tags ? String(row.tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              level: row.level ? parseInt(String(row.level), 10) : existing.level,
              order: row.order ? parseInt(String(row.order), 10) : existing.order,
            },
          })
          results.updated++
        } else {
          await this.prisma.wordBank.create({
            data: {
              letter,
              word,
              language,
              difficulty: difficulty as never,
              categoryId,
              description: String(row.description || '') || undefined,
              tags: row.tags ? String(row.tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
              level: row.level ? parseInt(String(row.level), 10) : 1,
              order: row.order ? parseInt(String(row.order), 10) : 0,
            },
          })
          results.created++
        }
      } catch (err) {
        results.errors++
        results.errorDetails.push(`Row ${JSON.stringify(row)}: ${(err as Error).message}`)
      }
    }

    await this.auditService.log({
      entityType: 'Import',
      entityId: 'words',
      action: 'CREATE',
      newValue: results,
      userId,
      reason: 'Bulk import words',
    })

    return results
  }

  async importCategories(data: Array<Record<string, unknown>>, userId: string) {
    const results = { created: 0, updated: 0, errors: 0, errorDetails: [] as string[] }

    for (const row of data) {
      try {
        const name = String(row.name || '').trim()
        if (!name) { results.errors++; continue }

        const slug = String(row.slug || name.toLowerCase().replace(/\s+/g, '-')).toLowerCase()

        const existing = await this.prisma.category.findUnique({ where: { slug } })

        if (existing) {
          await this.prisma.category.update({
            where: { id: existing.id },
            data: {
              name,
              description: String(row.description || '') || undefined,
              icon: String(row.icon || '') || undefined,
              color: String(row.color || '') || undefined,
              language: String(row.language || 'en'),
            },
          })
          results.updated++
        } else {
          await this.prisma.category.create({
            data: { name, slug, description: String(row.description || '') || undefined, icon: String(row.icon || '') || undefined, color: String(row.color || '') || undefined, language: String(row.language || 'en') },
          })
          results.created++
        }
      } catch (err) {
        results.errors++
        results.errorDetails.push(`Row ${JSON.stringify(row)}: ${(err as Error).message}`)
      }
    }

    await this.auditService.log({
      entityType: 'Import',
      entityId: 'categories',
      action: 'CREATE',
      newValue: results,
      userId,
      reason: 'Bulk import categories',
    })

    return results
  }

  async importJson(entity: string, data: Array<Record<string, unknown>>, userId: string) {
    switch (entity) {
      case 'words': return this.importWords(data, userId)
      case 'categories': return this.importCategories(data, userId)
      default:
        throw new BadRequestException(`Unsupported entity for import: ${entity}`)
    }
  }

  async exportWords(params: { language?: string; categoryId?: string; isActive?: string }) {
    const where: Record<string, unknown> = {}
    if (params.language) where.language = params.language
    if (params.categoryId) where.categoryId = params.categoryId
    if (params.isActive !== undefined) where.isActive = params.isActive === 'true'

    const words = await this.prisma.wordBank.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ language: 'asc' }, { letter: 'asc' }, { order: 'asc' }],
    })

    return words.map((w) => ({
      letter: w.letter,
      word: w.word,
      language: w.language,
      difficulty: w.difficulty,
      category: w.category?.name ?? '',
      description: w.description ?? '',
      tags: w.tags.join(', '),
      level: w.level,
      order: w.order,
      isActive: w.isActive,
    }))
  }

  async exportCategories(params: { language?: string; isActive?: string }) {
    const where: Record<string, unknown> = {}
    if (params.language) where.language = params.language
    if (params.isActive !== undefined) where.isActive = params.isActive === 'true'

    return this.prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
    })
  }
}
