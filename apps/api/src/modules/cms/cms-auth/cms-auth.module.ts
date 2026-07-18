import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaModule } from '../../../prisma/prisma.module'
import { CmsAuthController } from './cms-auth.controller'
import { CmsAuthService } from './cms-auth.service'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../auth/constants'

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
  ],
  controllers: [CmsAuthController],
  providers: [CmsAuthService],
  exports: [CmsAuthService],
})
export class CmsAuthModule {}
