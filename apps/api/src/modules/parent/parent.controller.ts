import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ParentService } from './parent.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator'

import { Public } from '../../common/decorators/public.decorator'

@ApiTags('Parent Portal')
@ApiBearerAuth()
@Public()
@UseGuards(JwtAuthGuard)
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('children')
  @ApiOperation({ summary: 'List all linked children' })
  async getChildren(@CurrentUser() user: CurrentUserType) {
    return this.parentService.getChildren(user.id)
  }

  @Get('children/:childId/progress')
  @ApiOperation({ summary: 'Get detailed progress for a child' })
  async getChildProgress(
    @CurrentUser() user: CurrentUserType,
    @Param('childId') childId: string,
  ) {
    return this.parentService.getChildProgress(user.id, childId)
  }

  @Get('children/:childId/analytics')
  @ApiOperation({ summary: 'Get analytics for a child' })
  async getChildAnalytics(
    @CurrentUser() user: CurrentUserType,
    @Param('childId') childId: string,
    @Query('days') days?: string,
  ) {
    return this.parentService.getChildAnalytics(user.id, childId, days ? parseInt(days, 10) : 30)
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get parent settings' })
  async getSettings(@CurrentUser() user: CurrentUserType) {
    return this.parentService.getSettings(user.id)
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update parent settings' })
  async updateSettings(
    @CurrentUser() user: CurrentUserType,
    @Body() data: { dailyTimeLimit?: number; contentRestrictions?: Record<string, unknown>; enableReports?: boolean; reportFrequency?: string },
  ) {
    return this.parentService.updateSettings(user.id, data)
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get generated reports' })
  async getReports(
    @CurrentUser() user: CurrentUserType,
    @Query('childId') childId?: string,
  ) {
    return this.parentService.getReports(user.id, childId)
  }

  @Post('reports/generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a new report for a child' })
  async generateReport(
    @CurrentUser() user: CurrentUserType,
    @Body() body: { childId: string; period: string },
  ) {
    return this.parentService.generateReport(user.id, body.childId, body.period)
  }
}
