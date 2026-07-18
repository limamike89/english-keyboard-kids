import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuditModule } from '../../modules/audit/audit.module'
import { ImportExportController } from './import-export.controller'
import { ImportExportService } from './import-export.service'

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ImportExportController],
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
