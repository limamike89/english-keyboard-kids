import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, UseInterceptors,
  UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { MediaService } from './media.service'
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard'
import { CmsRoleGuard } from '../../modules/cms/common/guards/cms-role.guard'
import { CmsRoles } from '../../modules/cms/common/decorators/cms-role.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('CMS Media')
@ApiBearerAuth()
@Public()
@UseGuards(JwtAuthGuard, CmsRoleGuard)
@Controller('cms/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @CmsRoles('ADMIN', 'EDITOR')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload media file' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('altText') altText: string,
    @Body('language') language: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.mediaService.upload(file, user.id, altText, language)
  }

  @Get()
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'List media files' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('language') language?: string,
    @Query('search') search?: string,
  ) {
    return this.mediaService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type, language, search,
    })
  }

  @Get(':id')
  @CmsRoles('ADMIN', 'EDITOR', 'VIEWER')
  @ApiOperation({ summary: 'Get media details' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id)
  }

  @Put(':id')
  @CmsRoles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update media metadata' })
  async update(
    @Param('id') id: string,
    @Body() body: { altText?: string; language?: string },
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.mediaService.update(id, body, user.id)
  }

  @Post(':id/replace')
  @CmsRoles('ADMIN', 'EDITOR')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Replace media file (new version)' })
  async replaceFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.mediaService.replaceFile(id, file, user.id)
  }

  @Delete(':id')
  @CmsRoles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media file' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    await this.mediaService.remove(id, user.id)
  }
}
