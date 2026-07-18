import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { APP_NAME, APP_VERSION } from '../../common/constants';
import { getEnvValue } from '../../config/env.config';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  check() {
    return {
      status: 'healthy',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: APP_VERSION,
      environment: getEnvValue('NODE_ENV'),
    };
  }

  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw new ServiceUnavailableException({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'Database is not reachable',
        details: null,
      });
    }
  }
}
