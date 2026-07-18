import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { AIController } from './ai.controller'
import { AIService } from './ai.service'

@Module({
  imports: [PrismaModule],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
