import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../../modules/audit/audit.service'
import { join } from 'path'
import { existsSync, unlinkSync } from 'fs'

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async upload(file: Express.Multer.File, userId: string, altText?: string, language?: string) {
    if (!file) throw new BadRequestException('No file provided')

    const type = file.mimetype.startsWith('image/') ? 'image' : 'audio'

    const media = await this.prisma.media.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type,
        altText: altText ?? null,
        language: language ?? null,
        versions: {
          create: {
            version: 1,
            filename: file.filename,
            size: file.size,
            metadata: {
              originalName: file.originalname,
              mimeType: file.mimetype,
            },
          },
        },
      },
      include: { versions: true },
    })

    await this.auditService.log({
      entityType: 'Media',
      entityId: media.id,
      action: 'CREATE',
      newValue: { filename: file.filename, originalName: file.originalname, type, size: file.size },
      userId,
    })

    return media
  }

  async findAll(params: { page?: number; limit?: number; type?: string; language?: string; search?: string }) {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (params.type) where.type = params.type
    if (params.language) where.language = params.language
    if (params.search) {
      where.OR = [
        { originalName: { contains: params.search, mode: 'insensitive' } },
        { altText: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { versions: { orderBy: { version: 'desc' } } },
      }),
      this.prisma.media.count({ where }),
    ])

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' } } },
    })
    if (!media) throw new NotFoundException('Media not found')
    return media
  }

  async update(id: string, data: { altText?: string; language?: string }, userId: string) {
    const media = await this.prisma.media.findUnique({ where: { id } })
    if (!media) throw new NotFoundException('Media not found')

    const oldValue = { altText: media.altText, language: media.language }

    const updated = await this.prisma.media.update({
      where: { id },
      data: {
        altText: data.altText ?? media.altText,
        language: data.language ?? media.language,
      },
    })

    await this.auditService.log({
      entityType: 'Media',
      entityId: id,
      action: 'UPDATE',
      oldValue,
      newValue: { altText: data.altText, language: data.language },
      userId,
    })

    return updated
  }

  async replaceFile(id: string, file: Express.Multer.File, userId: string) {
    if (!file) throw new BadRequestException('No file provided')

    const media = await this.prisma.media.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' } } },
    })
    if (!media) throw new NotFoundException('Media not found')

    const lastVersion = media.versions[0]?.version ?? 0

    const updated = await this.prisma.media.update({
      where: { id },
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        versions: {
          create: {
            version: lastVersion + 1,
            filename: file.filename,
            size: file.size,
            metadata: {
              originalName: file.originalname,
              mimeType: file.mimetype,
            },
          },
        },
      },
      include: { versions: { orderBy: { version: 'desc' } } },
    })

    await this.auditService.log({
      entityType: 'Media',
      entityId: id,
      action: 'UPDATE',
      fieldName: 'file',
      oldValue: { filename: media.filename, version: lastVersion },
      newValue: { filename: file.filename, version: lastVersion + 1 },
      userId,
    })

    return updated
  }

  async remove(id: string, userId: string) {
    const media = await this.prisma.media.findUnique({ where: { id } })
    if (!media) throw new NotFoundException('Media not found')

    const filePath = join(__dirname, '..', '..', '..', 'public', 'media', media.filename)
    if (existsSync(filePath)) {
      try { unlinkSync(filePath) } catch { /* ignore */ }
    }

    await this.prisma.media.delete({ where: { id } })

    await this.auditService.log({
      entityType: 'Media',
      entityId: id,
      action: 'DELETE',
      oldValue: { filename: media.filename, originalName: media.originalName },
      userId,
    })
  }
}
