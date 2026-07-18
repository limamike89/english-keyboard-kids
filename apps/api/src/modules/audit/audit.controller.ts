import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuditService } from './audit.service'
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard'
import { CmsRoleGuard } from '../../modules/cms/common/guards/cms-role.guard'
import { CmsRoles } from '../../modules/cms/common/decorators/cms-role.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('CMS Audit')
@ApiBearerAuth()
@Public()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
@Controller('cms/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit log entries' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      entityType,
      entityId,
      userId,
      action,
      startDate,
      endDate,
    })
  }
}
