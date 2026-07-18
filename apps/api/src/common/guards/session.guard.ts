import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SESSION_TOKEN_HEADER } from '../constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const sessionToken = request.headers[SESSION_TOKEN_HEADER];

    if (!sessionToken) {
      throw new UnauthorizedException('Missing session token');
    }

    const session = await this.prisma.userSession.findUnique({
      where: { sessionToken: sessionToken as string },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session token expired');
    }

    request.user = {
      id: session.user.id,
      sessionToken: session.sessionToken,
      displayName: session.user.displayName,
      isAnonymous: true,
    };

    return true;
  }
}
