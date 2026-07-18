import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { PrismaModule } from '../../prisma/prisma.module'
import { MediaController } from './media.controller'
import { MediaService } from './media.service'
import { AuditModule } from '../../modules/audit/audit.module'

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'public', 'media'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowedMimes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4',
        ]
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error('Invalid file type'), false)
        }
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
