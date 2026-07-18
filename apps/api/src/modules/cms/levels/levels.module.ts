import { Module } from '@nestjs/common'
import { PrismaModule } from '../../../prisma/prisma.module'
import { AuditModule } from '../../audit/audit.module'
import { LevelsController } from './levels.controller'
import { LevelsService } from './levels.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LevelsController],
  providers: [LevelsService],
})
export class LevelsModule {}
