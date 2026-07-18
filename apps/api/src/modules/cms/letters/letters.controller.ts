import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LettersService } from './letters.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { CmsPaginationDto } from '../common/dto/pagination.dto'
import { ToggleStatusDto } from '../common/dto/crud.dto'

@ApiTags('CMS Letters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/letters')
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List all letters' })
  async findAll(@Query() query: CmsPaginationDto & { language?: string; isActive?: string }) {
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
    return this.lettersService.findAll(query.page, query.limit, query.search, query.language, isActive)
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get a letter by ID' })
  async findOne(@Param('id') id: string) {
    return this.lettersService.findOne(id)
  }

  @Post()
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create a letter' })
  async create(
    @Body() body: {
      letter: string
      word: string
      difficulty: string
      language: string
      description?: string
      imageUrl?: string
      audioUrl?: string
      categoryId?: string
      tags?: string[]
      order?: number
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.lettersService.create(body, user.id)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update a letter' })
  async update(
    @Param('id') id: string,
    @Body() body: {
      letter?: string
      word?: string
      difficulty?: string
      language?: string
      description?: string
      imageUrl?: string
      audioUrl?: string
      categoryId?: string
      tags?: string[]
      order?: number
    },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.lettersService.update(id, body, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Soft delete a letter' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.lettersService.remove(id, user.id)
  }

  @Put(':id/status')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Toggle letter active status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: ToggleStatusDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.lettersService.toggleStatus(id, body.isActive, user.id)
  }
}
