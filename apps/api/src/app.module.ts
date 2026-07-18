import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './modules/health/health.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { GameModule } from './modules/game/game.module';
import { AudioModule } from './modules/audio/audio.module';
import { ProgressModule } from './modules/progress/progress.module';
import { StatsModule } from './modules/stats/stats.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { ParentModule } from './modules/parent/parent.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { AIModule } from './modules/ai/ai.module';
import { CmsModule } from './modules/cms/cms.module';
import { MediaModule } from './modules/media/media.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { AuditModule } from './modules/audit/audit.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SessionGuard } from './common/guards/session.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { getEnvValue } from './config/env.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: getEnvValue('RATE_LIMIT_TTL') * 1000,
        limit: getEnvValue('RATE_LIMIT_MAX'),
      },
    ]),
    LoggerModule,
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'audio'),
      serveRoot: '/audio',
      serveStaticOptions: {
        index: false,
        extensions: ['mp3', 'ogg', 'wav'],
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public', 'media'),
      serveRoot: '/media',
      serveStaticOptions: {
        index: false,
      },
    }),
    HealthModule,
    SessionsModule,
    LessonsModule,
    GameModule,
    AudioModule,
    ProgressModule,
    StatsModule,
    AnalyticsModule,
    AuthModule,
    ParentModule,
    TeacherModule,
    AIModule,
    CmsModule,
    MediaModule,
    ImportExportModule,
    AuditModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
