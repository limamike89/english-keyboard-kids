import { Module } from '@nestjs/common'
import { PrismaModule } from '../../../prisma/prisma.module'
import { AuditModule } from '../../audit/audit.module'
import { AchievementsController } from './achievements.controller'
import { AchievementsService } from './achievements.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
})
export class AchievementsModule {}
