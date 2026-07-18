import { Module } from '@nestjs/common'
import { PrismaModule } from '../../../prisma/prisma.module'
import { AuditModule } from '../../audit/audit.module'
import { LanguagesController } from './languages.controller'
import { LanguagesService } from './languages.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LanguagesController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
