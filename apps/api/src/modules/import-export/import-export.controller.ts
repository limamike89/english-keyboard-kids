import { Controller, Post, Get, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ImportExportService } from './import-export.service'
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard'
import { CmsRoleGuard } from '../../modules/cms/common/guards/cms-role.guard'
import { CmsRoles } from '../../modules/cms/common/decorators/cms-role.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('CMS Import/Export')
@ApiBearerAuth()
@Public()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('import/json')
  @CmsRoles('ADMIN', 'EDITOR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import data from JSON' })
  async importJson(
    @Body() body: { entity: string; data: Array<Record<string, unknown>> },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.importExportService.importJson(body.entity, body.data, user.id)
  }

  @Get('export/words')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Export words' })
  async exportWords(
    @Query('language') language?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.importExportService.exportWords({ language, categoryId, isActive })
  }

  @Get('export/categories')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Export categories' })
  async exportCategories(
    @Query('language') language?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.importExportService.exportCategories({ language, isActive })
  }
}
