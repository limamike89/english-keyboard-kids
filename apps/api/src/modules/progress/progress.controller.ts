import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';
import { ProgressSummary, ProgressItem, StreakInfo } from './interfaces/progress.interface';

@ApiTags('Progress')
@ApiSecurity('session-token')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all progress for the current user' })
  @ApiResponse({ status: 200, description: 'Progress summary retrieved' })
  @ApiResponse({ status: 401, description: 'Missing or invalid session token' })
  async findAll(@CurrentUser() user: CurrentUserType): Promise<ProgressSummary> {
    return this.progressService.findAll(user.id);
  }

  @Get(':lessonId')
  @ApiOperation({ summary: 'Get progress for a specific lesson' })
  @ApiResponse({ status: 200, description: 'Lesson progress retrieved' })
  @ApiResponse({ status: 401, description: 'Missing or invalid session token' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findByLesson(
    @CurrentUser() user: CurrentUserType,
    @Param('lessonId') lessonId: string,
  ): Promise<ProgressItem> {
    return this.progressService.findByLesson(user.id, lessonId);
  }

  @Get(':lessonId/streak')
  @ApiOperation({ summary: 'Get streak info for a lesson' })
  @ApiResponse({ status: 200, description: 'Streak info retrieved' })
  @ApiResponse({ status: 401, description: 'Missing or invalid session token' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findStreak(
    @CurrentUser() user: CurrentUserType,
    @Param('lessonId') lessonId: string,
  ): Promise<StreakInfo> {
    return this.progressService.findStreak(user.id, lessonId);
  }
}
