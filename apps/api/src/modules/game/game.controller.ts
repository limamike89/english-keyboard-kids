import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { GameService } from './game.service';
import { StartGameDto } from './dto/start-game.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {
  GameStartResponse,
  GameSubmitResponse,
  GameStateResponse,
  GameFinishResponse,
} from './interfaces/game.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Game')
@Controller('game')
@ApiSecurity('session-token')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new game session' })
  @ApiResponse({ status: 201, description: 'Game session created' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 400, description: 'Lesson has no questions' })
  async start(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: StartGameDto,
  ): Promise<GameStartResponse> {
    return this.gameService.start(user.id, dto.lessonId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit an answer for the current question' })
  @ApiResponse({ status: 200, description: 'Answer evaluated' })
  @ApiResponse({ status: 404, description: 'Game session not found' })
  @ApiResponse({ status: 400, description: 'Invalid state or question mismatch' })
  async submit(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: SubmitAnswerDto,
  ): Promise<GameSubmitResponse> {
    return this.gameService.submit(user.id, dto.gameSessionId, dto.questionId, dto.answer);
  }

  @Get(':sessionId/state')
  @ApiOperation({ summary: 'Get current game state' })
  @ApiResponse({ status: 200, description: 'Game state retrieved' })
  @ApiResponse({ status: 404, description: 'Game session not found' })
  async getState(
    @CurrentUser() user: CurrentUserType,
    @Param('sessionId') sessionId: string,
  ): Promise<GameStateResponse> {
    return this.gameService.getState(user.id, sessionId);
  }

  @Post(':sessionId/finish')
  @ApiOperation({ summary: 'Finish or abandon a game session' })
  @ApiResponse({ status: 200, description: 'Game session finished' })
  @ApiResponse({ status: 404, description: 'Game session not found' })
  @ApiResponse({ status: 400, description: 'Game already completed' })
  async finish(
    @CurrentUser() user: CurrentUserType,
    @Param('sessionId') sessionId: string,
  ): Promise<GameFinishResponse> {
    return this.gameService.finish(user.id, sessionId);
  }
}
