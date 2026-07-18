import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ConfigService } from './config.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { CmsPaginationDto } from '../common/dto/pagination.dto'

@ApiTags('CMS Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List all settings' })
  async findAll(@Query() query: CmsPaginationDto & { category?: string; isPublic?: string }) {
    const isPublic = query.isPublic !== undefined ? query.isPublic === 'true' : undefined
    return this.configService.findAll(query.page, query.limit, query.category, isPublic)
  }

  @Get('public')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get all public settings' })
  async getPublic() {
    return this.configService.getPublic()
  }

  @Get('game')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get all game configs' })
  async getGameConfigs() {
    return this.configService.getGameConfigs()
  }

  @Get('key/:key')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get a setting by key' })
  async findByKey(@Param('key') key: string) {
    return this.configService.findByKey(key)
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get a setting by ID' })
  async findOne(@Param('id') id: string) {
    return this.configService.findOne(id)
  }

  @Post()
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Upsert a setting' })
  async upsert(
    @Body() body: {
      key: string
      value: unknown
      description?: string
      category?: string
      isPublic?: boolean
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.configService.upsert(body.key, body.value, user.id, body.description, body.category, body.isPublic)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update a setting' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      key?: string
      value?: unknown
      description?: string
      category?: string
      isPublic?: boolean
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.configService.update(id, body, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Delete a setting' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.configService.remove(id, user.id)
  }
}
