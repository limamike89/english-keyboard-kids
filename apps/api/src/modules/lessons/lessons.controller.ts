import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';
import { LessonsService } from './lessons.service';
import { LessonListItem, LessonDetail, QuestionItem } from './interfaces/lesson.interface';
import { Public } from '../../common/decorators/public.decorator';
import { SESSION_TOKEN_HEADER } from '../../common/constants';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all available lessons' })
  @ApiQuery({ name: 'mode', required: false, enum: ['LETTERS', 'NUMBERS', 'MIXED'] })
  @ApiQuery({ name: 'language', required: false, example: 'en' })
  @ApiResponse({ status: 200, description: 'List of lessons' })
  async findAll(
    @Query('mode') mode?: string,
    @Query('language') language?: string,
    @Req() req?: Request,
  ): Promise<LessonListItem[]> {
    let userId: string | undefined;

    const sessionToken = req?.headers?.[SESSION_TOKEN_HEADER] as string | undefined;
    if (sessionToken) {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (session && session.expiresAt > new Date()) {
        userId = session.user.id;
      }
    }

    return this.lessonsService.findAll({ mode, language }, userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get lesson details' })
  @ApiResponse({ status: 200, description: 'Lesson details' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findById(@Param('id') id: string): Promise<LessonDetail> {
    return this.lessonsService.findById(id);
  }

  @Get(':id/questions')
  @Public()
  @ApiOperation({ summary: 'Get questions for a lesson' })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] })
  @ApiResponse({ status: 200, description: 'List of questions' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findQuestions(
    @Param('id') id: string,
    @Query('difficulty') difficulty?: string,
  ): Promise<QuestionItem[]> {
    return this.lessonsService.findQuestions(id, { difficulty });
  }
}
