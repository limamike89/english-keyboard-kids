import { Module } from '@nestjs/common'
import { PrismaModule } from '../../../prisma/prisma.module'
import { AuditModule } from '../../audit/audit.module'
import { ConfigController } from './config.controller'
import { ConfigService } from './config.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigModule {}
