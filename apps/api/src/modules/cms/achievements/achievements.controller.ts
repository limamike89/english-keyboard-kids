import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AchievementsService } from './achievements.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { CmsPaginationDto } from '../common/dto/pagination.dto'
import { ToggleStatusDto } from '../common/dto/crud.dto'

@ApiTags('CMS Achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List all achievements' })
  async findAll(@Query() query: CmsPaginationDto & { category?: string; isActive?: string }) {
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
    return this.achievementsService.findAll(query.page, query.limit, query.search, query.category, isActive)
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get an achievement by ID' })
  async findOne(@Param('id') id: string) {
    return this.achievementsService.findOne(id)
  }

  @Post()
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create an achievement' })
  async create(
    @Body() body: {
      key?: string
      name: string
      description: string
      icon?: string
      iconUrl?: string
      category?: string
      group?: string
      criteria?: Record<string, unknown>
      rules?: Record<string, unknown>
      xpReward?: number
      coinsReward?: number
      maxProgress?: number
      isActive?: boolean
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.achievementsService.create(body, user.id)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update an achievement' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      key?: string
      name?: string
      description?: string
      icon?: string
      iconUrl?: string
      category?: string
      group?: string
      criteria?: Record<string, unknown>
      rules?: Record<string, unknown>
      xpReward?: number
      coinsReward?: number
      maxProgress?: number
      isActive?: boolean
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.achievementsService.update(id, body, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Soft delete an achievement' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.achievementsService.remove(id, user.id)
  }

  @Put(':id/status')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Toggle achievement active status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: ToggleStatusDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.achievementsService.toggleStatus(id, body.isActive, user.id)
  }
}
