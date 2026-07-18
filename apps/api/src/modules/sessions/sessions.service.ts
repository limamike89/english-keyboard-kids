import { Injectable, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { getEnvValue } from '../../config/env.config';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionResponse, CurrentSessionResponse } from './interfaces/session.interface';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSessionDto): Promise<SessionResponse> {
    const displayName = dto.displayName || 'Player';
    const language = dto.language || 'en';
    const sessionToken = uuidv4();
    const expiresInDays = 30;

    const user = await this.prisma.user.create({
      data: {
        username: `player_${uuidv4().slice(0, 8)}`,
        displayName,
        language,
        roles: { create: { role: 'CHILD' } },
        sessions: {
          create: {
            sessionToken,
            expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    return {
      sessionToken,
      user: {
        id: user.id,
        displayName: user.displayName,
        language: user.language,
        isAnonymous: true,
        xp: user.xp,
        coins: user.coins,
      },
    };
  }

  async getCurrent(userId: string): Promise<CurrentSessionResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const [totalAnswers, totalCorrect] = await Promise.all([
      this.prisma.userAnswer.count({ where: { userId } }),
      this.prisma.userAnswer.count({ where: { userId, isCorrect: true } }),
    ]);

    return {
      id: user.id,
      displayName: user.displayName,
      language: user.language,
      isAnonymous: true,
      xp: user.xp,
      coins: user.coins,
      stats: {
        gamesPlayed: 0,
        totalCorrect,
        totalIncorrect: totalAnswers - totalCorrect,
      },
    };
  }

  async update(userId: string, dto: UpdateSessionDto): Promise<CurrentSessionResponse> {
    const data: Record<string, string> = {};
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.language !== undefined) data.language = dto.language;

    if (Object.keys(data).length === 0) {
      return this.getCurrent(userId);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.getCurrent(userId);
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({ where: { userId } });
  }
}
