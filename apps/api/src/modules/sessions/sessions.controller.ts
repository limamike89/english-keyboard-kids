import { Controller, Post, Get, Patch, Delete, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionResponse, CurrentSessionResponse } from './interfaces/session.interface';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create an anonymous session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateSessionDto): Promise<SessionResponse> {
    return this.sessionsService.create(dto);
  }

  @Post('link')
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('session-token')
  @ApiOperation({ summary: 'Link this child session to a parent via a link code' })
  @ApiResponse({ status: 200, description: 'Child linked to parent' })
  @ApiResponse({ status: 401, description: 'Invalid or expired link code' })
  async link(
    @CurrentUser() user: CurrentUser,
    @Body() body: { code: string },
  ) {
    return this.authService.redeemLinkCode(body.code, user.id)
  }

  @Get('me')
  @ApiSecurity('session-token')
  @ApiOperation({ summary: 'Get current session info' })
  @ApiResponse({ status: 200, description: 'Session info retrieved' })
  @ApiResponse({ status: 401, description: 'Missing or invalid session token' })
  async getCurrent(@CurrentUser() user: CurrentUser): Promise<CurrentSessionResponse> {
    return this.sessionsService.getCurrent(user.id);
  }

  @Patch('me')
  @ApiSecurity('session-token')
  @ApiOperation({ summary: 'Update session preferences' })
  @ApiResponse({ status: 200, description: 'Session updated' })
  @ApiResponse({ status: 401, description: 'Missing or invalid session token' })
  async update(
    @CurrentUser() user: CurrentUser,
    @Body() dto: UpdateSessionDto,
  ): Promise<CurrentSessionResponse> {
    return this.sessionsService.update(user.id, dto);
  }

  @Delete('me')
  @ApiSecurity('session-token')
  @ApiOperation({ summary: 'Delete current session' })
  @ApiResponse({ status: 204, description: 'Session deleted' })
  @ApiResponse({ status: 401, description: 'Missing or invalid session token' })
  async delete(@CurrentUser() user: CurrentUser): Promise<void> {
    return this.sessionsService.delete(user.id);
  }
}
