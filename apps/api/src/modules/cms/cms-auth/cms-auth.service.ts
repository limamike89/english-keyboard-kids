import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../../prisma/prisma.service'
import { UserRoleType } from '@prisma/client'

@Injectable()
export class CmsAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const cmsRoles: UserRoleType[] = ['ADMIN', 'EDITOR', 'TEACHER', 'VIEWER']
    const hasCmsRole = user.roles.some((r) => cmsRoles.includes(r.role))
    if (!hasCmsRole) {
      throw new UnauthorizedException('Account does not have CMS access')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const roles = user.roles.map((r) => r.role)
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      roles,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles,
      },
    }
  }

  async register(email: string, password: string, displayName: string, role: UserRoleType) {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const username = `cms_${email.split('@')[0]}_${Date.now().toString(36)}`

    const user = await this.prisma.user.create({
      data: {
        username,
        displayName,
        email,
        passwordHash,
        roles: { create: { role } },
      },
    })

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      roles: [role],
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles: [role],
      },
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    })
    if (!user) throw new UnauthorizedException('User not found')

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles.map((r) => r.role),
      avatarUrl: user.avatarUrl,
    }
  }
}
