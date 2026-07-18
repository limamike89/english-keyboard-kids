import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { IncomingMessage } from 'http';
import { getEnvValue } from '../config/env.config';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: getEnvValue('LOG_LEVEL'),
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        serializers: {
          req: (req: { method: string; url: string; headers: Record<string, string> }) => ({
            method: req.method,
            url: req.url,
            headers: req.headers,
          }),
          res: (res: { statusCode: number }) => ({
            statusCode: res.statusCode,
          }),
        },
        autoLogging: {
          ignore: (req: IncomingMessage) => req.url === '/api/v1/health',
        },
      },
    }),
  ],
})
export class LoggerModule {}
