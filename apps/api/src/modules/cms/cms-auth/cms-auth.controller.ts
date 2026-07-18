import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRoleType } from '@prisma/client'
import { CmsAuthService } from './cms-auth.service'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'
import { CmsRoleGuard } from '../common/guards/cms-role.guard'
import { CmsRoles } from '../common/decorators/cms-role.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { CurrentUser as CurrentUserType } from '../../../common/decorators/current-user.decorator'
import { Public } from '../../../common/decorators/public.decorator'

@ApiTags('CMS Auth')
@Controller('cms/auth')
export class CmsAuthController {
  constructor(private readonly cmsAuthService: CmsAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login to CMS' })
  async login(@Body() body: { email: string; password: string }) {
    return this.cmsAuthService.login(body.email, body.password)
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register CMS user' })
  async register(@Body() body: { email: string; password: string; displayName: string; role: UserRoleType }) {
    return this.cmsAuthService.register(body.email, body.password, body.displayName, body.role)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current CMS user profile' })
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return this.cmsAuthService.getProfile(user.id)
  }
}
