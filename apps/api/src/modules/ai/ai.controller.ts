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
import { AIService } from './ai.service'
import { SessionGuard } from '../../common/guards/session.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator'

@ApiTags('AI Learning Engine')
@ApiBearerAuth()
@UseGuards(SessionGuard)
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('next-questions')
  @ApiOperation({ summary: 'Get AI-selected next questions for a lesson' })
  async getNextQuestions(
    @CurrentUser() user: CurrentUserType,
    @Query('lessonId') lessonId: string,
    @Query('count') count?: string,
  ) {
    return this.aiService.getNextQuestions(user.id, lessonId, count ? parseInt(count, 10) : 10)
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI recommendations' })
  async getRecommendations(@CurrentUser() user: CurrentUserType) {
    return this.aiService.getRecommendations(user.id)
  }

  @Get('personalized-path')
  @ApiOperation({ summary: 'Get personalized learning path' })
  async getPersonalizedPath(@CurrentUser() user: CurrentUserType) {
    return this.aiService.getPersonalizedPath(user.id)
  }

  @Get('difficulty')
  @ApiOperation({ summary: 'Get computed difficulty level' })
  async getDifficulty(@CurrentUser() user: CurrentUserType) {
    return this.aiService.getDifficulty(user.id)
  }

  @Get('due-count')
  @ApiOperation({ summary: 'Get count of items due for review' })
  async getDueCount(@CurrentUser() user: CurrentUserType) {
    return this.aiService.getDueCount(user.id)
  }

  @Post('record-answer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record answer for AI learning' })
  async recordAnswer(
    @CurrentUser() user: CurrentUserType,
    @Body() body: { questionId: string; isCorrect: boolean; timeToAnswerMs: number },
  ) {
    await this.aiService.recordAnswer(user.id, body.questionId, body.isCorrect, body.timeToAnswerMs)
  }

  @Get('weak-area-questions')
  @ApiOperation({ summary: 'Get questions targeting weak areas' })
  async getWeakAreaQuestions(
    @CurrentUser() user: CurrentUserType,
    @Query('mode') mode: string,
    @Query('count') count?: string,
  ) {
    return this.aiService.getWeakAreaQuestions(user.id, mode as 'LETTERS' | 'NUMBERS', count ? parseInt(count, 10) : 5)
  }
}
