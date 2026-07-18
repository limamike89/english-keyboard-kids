import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LanguagesService } from './languages.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { CmsPaginationDto } from '../common/dto/pagination.dto'
import { ToggleStatusDto } from '../common/dto/crud.dto'

@ApiTags('CMS Languages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List all languages' })
  async findAll(@Query() query: CmsPaginationDto & { isActive?: string }) {
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
    return this.languagesService.findAll(query.page, query.limit, query.search, isActive)
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get a language by ID' })
  async findOne(@Param('id') id: string) {
    return this.languagesService.findOne(id)
  }

  @Post()
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create a language' })
  async create(
    @Body() body: {
      code: string
      name: string
      nativeName?: string
      flag?: string
      direction?: string
      isActive?: boolean
      isDefault?: boolean
      order?: number
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.languagesService.create(body, user.id)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update a language' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      code?: string
      name?: string
      nativeName?: string
      flag?: string
      direction?: string
      isActive?: boolean
      isDefault?: boolean
      order?: number
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.languagesService.update(id, body, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Soft delete a language' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.languagesService.remove(id, user.id)
  }

  @Put(':id/default')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Set language as default' })
  async setDefault(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.languagesService.setDefault(id, user.id)
  }

  @Put(':id/status')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Toggle language active status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: ToggleStatusDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.languagesService.toggleStatus(id, body.isActive, user.id)
  }
}
