import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { NumbersService } from './numbers.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { CmsPaginationDto } from '../common/dto/pagination.dto'
import { ToggleStatusDto } from '../common/dto/crud.dto'

@ApiTags('CMS Numbers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/numbers')
export class NumbersController {
  constructor(private readonly numbersService: NumbersService) {}

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List all numbers' })
  async findAll(@Query() query: CmsPaginationDto & { language?: string; isActive?: string }) {
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined
    return this.numbersService.findAll(query.page, query.limit, query.search, query.language, isActive)
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get a number by ID' })
  async findOne(@Param('id') id: string) {
    return this.numbersService.findOne(id)
  }

  @Post()
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create a number' })
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
    return this.numbersService.create(body, user.id)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update a number' })
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
    return this.numbersService.update(id, body, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Soft delete a number' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.numbersService.remove(id, user.id)
  }

  @Put(':id/status')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Toggle number active status' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: ToggleStatusDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.numbersService.toggleStatus(id, body.isActive, user.id)
  }
}
