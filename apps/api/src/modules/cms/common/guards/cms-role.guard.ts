import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRoleType } from '@prisma/client'
import { CMS_ROLES_KEY } from '../decorators/cms-role.decorator'

@Injectable()
export class CmsRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleType[]>(CMS_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: no roles found')
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role))
    if (!hasRole) {
      throw new ForbiddenException('Access denied: insufficient permissions')
    }

    return true
  }
}
