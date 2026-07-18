import { SetMetadata } from '@nestjs/common'
import { UserRoleType } from '@prisma/client'

export const CMS_ROLES_KEY = 'cms-roles'
export const CmsRoles = (...roles: UserRoleType[]) => SetMetadata(CMS_ROLES_KEY, roles)
