import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LevelsService } from './levels.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { CmsPaginationDto } from '../common/dto/pagination.dto'
import { ToggleStatusDto } from '../common/dto/crud.dto'

@ApiTags('CMS Levels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List all levels' })
  async findAll(@Query() query: CmsPaginationDto & { mode?: string; language?: string; isActive?: string }) {
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
    return this.levelsService.findAll(query.page, query.limit, query.search, query.mode, query.language, isActive)
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get a level by ID' })
  async findOne(@Param('id') id: string) {
    return this.levelsService.findOne(id)
  }

  @Post()
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create a level' })
  async create(
    @Body() body: {
      mode: string
      language?: string
      title?: string
      description?: string
      level?: number
      order?: number
      questionCount?: number
      isActive?: boolean
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.levelsService.create(body, user.id)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update a level' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      mode?: string
      language?: string
      title?: string
      description?: string
      level?: number
      order?: number
      questionCount?: number
      isActive?: boolean
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.levelsService.update(id, body, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Soft delete a level' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.levelsService.remove(id, user.id)
  }

  @Put(':id/status')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Toggle level active status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: ToggleStatusDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.levelsService.toggleStatus(id, body.isActive, user.id)
  }
}
