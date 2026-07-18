import { Module } from '@nestjs/common'
import { PrismaModule } from '../../../prisma/prisma.module'
import { AuditModule } from '../../audit/audit.module'
import { LettersController } from './letters.controller'
import { LettersService } from './letters.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LettersController],
  providers: [LettersService],
})
export class LettersModule {}
