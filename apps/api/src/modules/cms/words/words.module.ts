import { Module } from '@nestjs/common'
import { PrismaModule } from '../../../prisma/prisma.module'
import { AuditModule } from '../../audit/audit.module'
import { WordsController } from './words.controller'
import { WordsService } from './words.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [WordsController],
  providers: [WordsService],
})
export class WordsModule {}
