import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('parent/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new parent account' })
  async register(
    @Body() body: { email: string; password: string; displayName: string },
  ) {
    return this.authService.register(body.email, body.password, body.displayName)
  }

  @Public()
  @Post('parent/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as parent' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password)
  }

  @Public()
  @Post('teacher/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new teacher account' })
  async registerTeacher(
    @Body() body: { email: string; password: string; displayName: string },
  ) {
    return this.authService.register(body.email, body.password, body.displayName, 'TEACHER')
  }

  @Post('parent/link-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a link code for parent-child binding' })
  async generateLinkCode(@CurrentUser() user: CurrentUserType) {
    return this.authService.generateLinkCode(user.id)
  }

  @Post('parent/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link a child account to the parent' })
  async linkChild(
    @CurrentUser() user: CurrentUserType,
    @Body() body: { childUsername: string },
  ) {
    return this.authService.linkChild(user.id, body.childUsername)
  }
}
