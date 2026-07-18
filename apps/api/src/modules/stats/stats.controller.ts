import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator';
import { StatsService } from './stats.service';
import { GlobalStats, ModeStats, HistoryEntry } from './interfaces/stats.interface';

@ApiTags('Stats')
@ApiSecurity('session-token')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global statistics for the current user' })
  @ApiResponse({ status: 200, description: 'Global stats retrieved' })
  async getGlobal(@CurrentUser() user: CurrentUserType): Promise<GlobalStats> {
    return this.statsService.getGlobal(user.id);
  }

  @Get('modes')
  @ApiOperation({ summary: 'Get statistics broken down by game mode' })
  @ApiResponse({ status: 200, description: 'Mode stats retrieved' })
  async getModes(@CurrentUser() user: CurrentUserType): Promise<ModeStats[]> {
    return this.statsService.getModes(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get recent answer history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'History retrieved' })
  async getHistory(
    @CurrentUser() user: CurrentUserType,
    @Query('limit') limit?: string,
  ): Promise<HistoryEntry[]> {
    return this.statsService.getHistory(user.id, limit ? Math.min(parseInt(limit, 10) || 20, 100) : 20);
  }
}
