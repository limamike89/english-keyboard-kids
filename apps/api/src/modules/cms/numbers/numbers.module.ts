import { Module } from '@nestjs/common'
import { PrismaModule } from '../../../prisma/prisma.module'
import { AuditModule } from '../../audit/audit.module'
import { NumbersController } from './numbers.controller'
import { NumbersService } from './numbers.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [NumbersController],
  providers: [NumbersService],
})
export class NumbersModule {}
