import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { CmsPaginationDto } from '../common/dto/pagination.dto'
import { ToggleStatusDto } from '../common/dto/crud.dto'

@ApiTags('CMS Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List all categories' })
  async findAll(@Query() query: CmsPaginationDto & { language?: string; isActive?: string }) {
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
    return this.categoriesService.findAll(query.page, query.limit, query.search, query.language, isActive)
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get a category by ID' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id)
  }

  @Post()
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create a category' })
  async create(
    @Body() body: {
      name: string
      slug?: string
      description?: string
      icon?: string
      color?: string
      language?: string
      order?: number
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoriesService.create(body, user.id)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update a category' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string
      slug?: string
      description?: string
      icon?: string
      color?: string
      language?: string
      order?: number
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoriesService.update(id, body, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Soft delete a category' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoriesService.remove(id, user.id)
  }

  @Put(':id/status')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Toggle category active status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: ToggleStatusDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.categoriesService.toggleStatus(id, body.isActive, user.id)
  }
}
