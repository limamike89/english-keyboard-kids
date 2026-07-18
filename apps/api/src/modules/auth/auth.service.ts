import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { LINK_CODE_PREFIX } from './constants'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, displayName: string, role: 'PARENT' | 'TEACHER' = 'PARENT'): Promise<{ token: string; user: { id: string; email: string; displayName: string } }> {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new UnauthorizedException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const username = `${role.toLowerCase()}_${email.split('@')[0]}_${Date.now().toString(36)}`

    const user = await this.prisma.user.create({
      data: {
        username,
        displayName,
        email,
        passwordHash,
        roles: { create: { role } },
      },
    })

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email!, role },
    )

    return { token, user: { id: user.id, email: user.email!, displayName: user.displayName } }
  }

  async login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; displayName: string } }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isParent = user.roles.some((r) => r.role === 'PARENT' || r.role === 'TEACHER' || r.role === 'ADMIN')
    if (!isParent) {
      throw new UnauthorizedException('Account is not a parent account')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email!, role: 'PARENT' },
    )

    return { token, user: { id: user.id, email: user.email!, displayName: user.displayName } }
  }

  async generateLinkCode(parentId: string): Promise<{ code: string }> {
    const raw = `${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const code = `${LINK_CODE_PREFIX}${raw}`
    await this.prisma.linkCode.create({
      data: {
        code,
        parentId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
    return { code }
  }

  async redeemLinkCode(code: string, childId: string): Promise<{ parentName: string }> {
    const linkCode = await this.prisma.linkCode.findUnique({ where: { code } })
    if (!linkCode || linkCode.redeemedAt) {
      throw new NotFoundException('Link code not found or already redeemed')
    }
    if (linkCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Link code has expired')
    }

    const existing = await this.prisma.parentChild.findUnique({
      where: { parentId_childId: { parentId: linkCode.parentId, childId } },
    })
    if (existing) {
      throw new ConflictException('Child already linked to this parent')
    }

    await this.prisma.parentChild.create({
      data: { parentId: linkCode.parentId, childId },
    })

    await this.prisma.linkCode.update({
      where: { id: linkCode.id },
      data: { childId, redeemedAt: new Date() },
    })

    const parent = await this.prisma.user.findUnique({ where: { id: linkCode.parentId } })
    return { parentName: parent?.displayName ?? 'Parent' }
  }

  async linkChild(parentId: string, childUsername: string): Promise<{ childId: string; childName: string }> {
    const child = await this.prisma.user.findUnique({
      where: { username: childUsername },
      include: { roles: true },
    })

    if (!child) {
      throw new UnauthorizedException('Child not found')
    }

    const isChild = child.roles.some((r) => r.role === 'CHILD')
    if (!isChild) {
      throw new UnauthorizedException('User is not a child account')
    }

    const existing = await this.prisma.parentChild.findUnique({
      where: { parentId_childId: { parentId, childId: child.id } },
    })

    if (existing) {
      throw new UnauthorizedException('Child already linked')
    }

    await this.prisma.parentChild.create({
      data: { parentId, childId: child.id },
    })

    return { childId: child.id, childName: child.displayName }
  }
}
