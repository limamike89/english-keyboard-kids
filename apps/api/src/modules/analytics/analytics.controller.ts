import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { SessionGuard } from '../../common/guards/session.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator'

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(SessionGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get learner profile with all analytics' })
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return this.analyticsService.getProfile(user.id)
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get analytics dashboard data' })
  async getDashboard(@CurrentUser() user: CurrentUserType) {
    return this.analyticsService.getDashboard(user.id)
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get learning trends' })
  async getTrends(
    @CurrentUser() user: CurrentUserType,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTrends(user.id, days ? parseInt(days, 10) : 30)
  }

  @Get('daily-activity')
  @ApiOperation({ summary: 'Get daily activity log' })
  async getDailyActivity(
    @CurrentUser() user: CurrentUserType,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getDailyActivity(user.id, days ? parseInt(days, 10) : 30)
  }

  @Get('weakest-letters')
  @ApiOperation({ summary: 'Get weakest letters for the user' })
  async getWeakestLetters(@CurrentUser() user: CurrentUserType) {
    return this.analyticsService.getWeakestLetters(user.id)
  }

  @Get('weakest-numbers')
  @ApiOperation({ summary: 'Get weakest numbers for the user' })
  async getWeakestNumbers(@CurrentUser() user: CurrentUserType) {
    return this.analyticsService.getWeakestNumbers(user.id)
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get learning recommendations' })
  async getRecommendations(@CurrentUser() user: CurrentUserType) {
    return this.analyticsService.getRecommendations(user.id)
  }

  @Post('track')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track an analytics event' })
  async trackEvent(
    @CurrentUser() user: CurrentUserType,
    @Body() data: { eventType: string; properties?: Record<string, unknown> },
  ) {
    await this.analyticsService.trackEvent({ userId: user.id, sessionId: user.sessionToken, ...data })
  }

  @Post('record-answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record an answer for difficulty tracking' })
  async recordAnswer(
    @CurrentUser() user: CurrentUserType,
    @Body() data: { questionId: string; isCorrect: boolean },
  ) {
    await this.analyticsService.recordAnswer(user.id, data.questionId, data.isCorrect)
  }

  @Post('refresh-metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh cached student metrics' })
  async refreshMetrics(@CurrentUser() user: CurrentUserType) {
    await this.analyticsService.refreshMetrics(user.id)
  }
}
